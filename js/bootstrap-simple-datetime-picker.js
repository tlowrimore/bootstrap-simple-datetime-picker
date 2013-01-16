// Copyright (c) 2013 Tim Lowrimore
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
// and associated documentation files (the "Software"), to deal in the Software without restriction, 
// including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
// and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial 
// portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function($) {
    
    // Pads single digits with one zero on the left.  We'll be using the hell out
    // of this.
    var lpad = function(digitStr) {
        return digitStr.toString().replace(/^(\d)$/, "0$1");
    };
    
    var getMeridian = function(date) {
        return ["am", "pm"][ Math.floor(date.getHours()/12) ]
    };
    
    // Regular expressions used in the date formatter and parser
    var dateFormatMatcher           = /%(?:-?[dHIm]|[aAbBMpPSyY])/g,
        twelveHourMatcher           = /%-?I/g,
        nonmutativeKeyCodeMatcher   = /9|13|16|17|18|20|27|37|38|39|40|91|93/;
    
    // Makes typing arrays suck less. Inspired by Ruby's %w().
    var $w = function(str) { return str.split(/\s+/); }
    
    // ----------------------------------------------------------------------------
    // Datetime Picker Constructor
    // ----------------------------------------------------------------------------
    
    var DatetimePicker = function(element, options) {
        // option defaults
        this.localeString       = options["locale"] || "en-US";
        this.format             = options["format"] || "%Y-%m-%d %H:%M";
        this.minutesInterval    = options["minutesInterval"] || 5;
        this.unparsable         = options["unparsable"];
        
        // make sure the minutesInterval is a factor of 60
        if(60 % this.minutesInterval) {
            throw new Error("The supplied 'minutesInterval' option must be a factor of 60.");
        }
        
        this.$element           = $(element); 
        this.formatter          = DatetimePicker.Formatter;
        this.parser             = DatetimePicker.Parser;
        this.locale             = DatetimePicker.locales[this.localeString];
        this.value              = new Date();
        this.monthOffset        = 0;

        this.initialize();
    };
    
    // ----------------------------------------------------------------------------
    // Datetime Picker Prototype
    // ----------------------------------------------------------------------------
    
    DatetimePicker.prototype = {
        constructor:    DatetimePicker,
        weeks:          6,
        daysInWeek:     7,
        
        // initializes the datetime picker
        initialize: function() {
            
            // Update our value with the value on the input field
            this.parseValue();
            
            var wrapper = $("<div></div>", { "class": "dropdown datetime-picker" });
            
            this.$element.addClass("dropdown-toggle")
                         .attr("data-toggle", "dropdown")
                         .wrap(wrapper)
                         .after(this.dropdown())
                         .dropdown()
                         .on("keyup", $.proxy(this.onDateStringChange, this));
                    
            this.$element.parent()
                         .on("click",   ".btn-previous",        $.proxy(this.onPrevious, this))
                         .on("click",   ".btn-next",            $.proxy(this.onNext, this))
                         .on("click",   ".btn-month",           $.proxy(this.onMonth, this))
                         .on("click",   ".btn-date",            $.proxy(this.onDateSelect, this))
                         .on("change",  ".hour-selector",       $.proxy(this.onHourSelect, this))
                         .on("change",  ".minute-selector",     $.proxy(this.onMinuteSelect, this))
                         .on("change",  ".meridian-selector",   $.proxy(this.onMeridianSelect, this))

                          // corrects undesirable behavior in FF.
                          .on("click",   ".hour-selector, .minute-selector, .meridian-selector", false);
                         
        },
        
        parseValue: function() {
            if(this.$element.val()) {
                try {
                    var time    = this.parser.parse(this.$element.val(), this.format, this.locale);
                    this.value.setTime(time);
                } catch(e) {
                    this.unparsable && this.unparsable.call(this.$element);
                }
            }
        },
        
        // initializes and returns the dropdown element
        dropdown: function() {
            if(!this.$dropdown) {
                this.$dropdown = $("<div></div>", { "class": "dropdown-menu", "role": "menu" }).append(this.calendar());
                
                // If the format has no time part, we'll assume we need no time selectors.
                if(this.formatter.hasTimePart(this.format)) {
                    this.$dropdown.append(this.timeSelectors());
                }
                
                this.render();
            }
            return this.$dropdown;
        },
        
        // initialize and returns the calendar element
        calendar: function() {
            if(!this.$calendar) {
                var body = $("<tbody></tbody>"),
                    row, 
                    btn;
                
                for(var w=0, n=this.weeks; w<n; w++) {
                    row = $("<tr></tr>").appendTo(body);
                    
                    for(var d=0, m=this.daysInWeek; d<m; d++) {
                        btn = $("<a></a>", { "href": "#", "class": "btn-date" });
                        $("<td></td>").append(btn).appendTo(row);
                        
                    }
                }
                
                this.$calendar = $("<table></table>", { "class": "calendar" }).append(this.header(), body);
            }
            return this.$calendar;
        },
        
        header: function() {
            if(!this.$header) {
                var cellPrevious    = $("<th><a href='#prev' class='btn-previous'><i class='icon-arrow-left'></i></a></th>"),
                    cellNext        = $("<th><a href='#next' class='btn-next'><i class='icon-arrow-right'></i></a></th>"),
                    cellMonthYear   = $("<th colspan='5'><a href='#month' class='btn-month'></a></th>"),
                    rowMonthYear    = $("<tr></tr>").append(cellPrevious, cellMonthYear, cellNext),
                    cellsDays       = $.map(this.locale.daysMin, function(day) { return $("<th></th>").html(day); });
                    rowDays         = $("<tr></tr>").append(cellsDays);
                
                this.$header = $("<thead></thead>").append(rowMonthYear, rowDays);
            }
            return this.$header;
        },
        
        timeSelectors: function() {
            if(!this.$timeSelectors) {
                var hourSelector        = $("<select class='hour-selector input-mini'></select>"),
                    minuteSelector      = $("<select class='minute-selector input-mini'></select>"),
                    hourOptions         = [],
                    minuteOptions       = [],
                    step                = this.minutesInterval,
                    isTwelveHourClock   = this.formatter.isTwelveHourFormat(this.format),
                    hourStart           = 0,
                    hourEnd             = 24;
                    
                // Update our hours range to reflect a 12 hour clock.
                if(isTwelveHourClock) {
                    hourStart           = 1;
                    hourEnd             = 13;
                }
                
                // populate hourSelector
                for(var i=hourStart, n=hourEnd; i<n; i++) {
                    hourOptions.push($("<option></option>", { "value": i }).html(lpad(i)));
                }
                
                // populate minuteSelector
                for(var i=0, n=60; i<n; i+=step) {
                    minuteOptions.push($("<option></option>", { "value": i }).html(lpad(i)));
                }
                
                hourSelector.append.apply(hourSelector, hourOptions);
                minuteSelector.append.apply(minuteSelector, minuteOptions);
                this.$timeSelectors = $("<div></div>", { "class": "time-selectors" }).append(hourSelector, " : ", minuteSelector);
                
                // If our date format is for a 12 hour clock, we'll also add a meridian selector
                if(isTwelveHourClock) {
                    var meridianSelector    = $("<select class='meridian-selector input-mini'></select>"),
                        meridianOptions     = $.map(["am", "pm"], function(m) {
                            return $("<option></option>", { "value": m }).html(m);
                        });
                    
                    meridianSelector.append.apply(meridianSelector, meridianOptions);
                    this.$timeSelectors.append(" ", meridianSelector);
                }
            }
            return this.$timeSelectors;
        },
        
        render: function() {
            this.renderDropdown();
            this.renderElementValue();
        },
        
        renderElementValue: function() {
            var formattedDate = this.formatter.format(this.value, this.format, this.locale);
            this.$element.val(formattedDate);
        },
        
        renderDropdown: function() {
            this.renderHeader();
            this.renderCalendar();
            this.formatter.hasTimePart(this.format) && this.renderTimeSelectors();
        },
        
        renderHeader: function() {
            var value           = this.value,
                currentMonth    = value.getMonth(),
                workingValue    = new Date(value);
                
            workingValue.setMonth(currentMonth + this.monthOffset);
            
            var month           = this.locale.months[workingValue.getMonth()],
                year            = workingValue.getFullYear(),
                monthYear       = [month, year].join(" ");
            
            this.header().find("a.btn-month").html(monthYear);
        },
        
        renderCalendar: function() {
            var value           = this.value,
                currentDate     = value.getDate(),
                currentTime     = value.getTime(),               
                workingValue    = new Date(value),
                dateButtons     = this.calendar().find("a.btn-date"),
                date, month, time, btn;
                
            // clear style classes from the date buttons
            dateButtons.removeClass("month-previous month-next date-current");
                
            // set the working date to first day of the currently rendered month
            workingValue.setMonth(value.getMonth() + this.monthOffset);
            workingValue.setDate(1);
            
            // The month we're currently rendering.
            var currentMonth = workingValue.getMonth();
            
            // now, set the working date to the 0th day of the current week.
            workingValue.setDate(-(workingValue.getDay() - 1));
            
            dateButtons.each(function() {
                date    = workingValue.getDate();
                month   = workingValue.getMonth();
                time    = workingValue.getTime();
                btn     = $(this);
                
                btn.attr("href", "#" + time).html(date);
                
                // set style classes for dates that fall within the previous and
                // next months.
                if(month !== currentMonth) {
                    if(value > workingValue) {
                        btn.addClass("month-previous");
                    } else if(value < workingValue) {
                        btn.addClass("month-next");
                    }
                }
                
                // highlight the current date.
                if(currentTime == time) {
                    btn.addClass("date-current");
                }
                
                workingValue.setDate(date + 1);
            });
        },
        
        renderTimeSelectors: function() {
            
            var value           = this.value,
                timeSelectors   = this.timeSelectors(),
                currentHours    = value.getHours(),
                currentMinutes  = Math.round(value.getMinutes() / this.minutesInterval) * this.minutesInterval,
                currentMeridian;
            
            if(this.formatter.isTwelveHourFormat(this.format)) {
                currentMeridian = getMeridian(value);
                currentHours    = currentHours % 12 || 12;
            }
            
            timeSelectors.find(".hour-selector").val(currentHours);
            timeSelectors.find(".minute-selector").val(currentMinutes);
            timeSelectors.find(".meridian-selector").val(currentMeridian);
        },
        
        selectedHour: function() {
            var timeSelectors   = this.timeSelectors(),
                meridian        = timeSelectors.find(".meridian-selector").val(),
                hour            = parseInt(timeSelectors.find(".hour-selector").val());
                
                if(meridian.toLowerCase() == "pm") hour = (hour + 12) % 24;
                
                return hour;
        },
        
        onPrevious: function(evt) {
            evt.stopImmediatePropagation();
            evt.preventDefault();
            
            this.monthOffset--;
            this.renderDropdown();
        },
        
        onNext: function(evt) {
            evt.stopImmediatePropagation();
            evt.preventDefault();
            
            this.monthOffset++;
            this.renderDropdown();
        },
        
        onMonth: function(evt) {
            evt.stopImmediatePropagation();
            evt.preventDefault();
        },
        
        onDateSelect: function(evt) {
            evt.preventDefault();
            
            var btn     = $(evt.currentTarget),
                time    = btn.attr("href").slice(1);
            
            this.value.setTime(time);
            this.monthOffset = 0;
            this.render();
            
            this.$element.focus();
        },
        
        onHourSelect: function(evt) {
            this.value.setHours(this.selectedHour());
            this.renderElementValue();
        },
        
        onMinuteSelect: function(evt) {
            var selector    = $(evt.currentTarget),
                minute      = selector.val();
            
            this.value.setMinutes(minute);
            this.renderElementValue();
        },
        
        onMeridianSelect: function(evt) {
            this.value.setHours(this.selectedHour());
            this.renderElementValue();
        },
        
        onDateStringChange: function(evt) {
            if(!nonmutativeKeyCodeMatcher.test(evt.keyCode)) {
                this.parseValue();
                this.renderDropdown();
            }
        },
        
        isShowing: function() {
            return this.$element.closest(".dropdown").hasClass("open");
        }
    };
    
    // ----------------------------------------------------------------------------
    // Date Formatter
    // ----------------------------------------------------------------------------
    
    DatetimePicker.Formatter = {
        timePartMatcher:    /%(?:-?[HI]|[MpPS])/g,
        
        getterFns: new function() { 
            this["%a"]  = function(date, locale)    { return locale.daysShort[date.getDay()]; };
            this["%A"]  = function(date, locale)    { return locale.days[date.getDay()]; };
            this["%b"]  = function(date, locale)    { return locale.monthsShort[date.getMonth()]; };
            this["%B"]  = function(date, locale)    { return locale.months[date.getMonth()]; };
            this["%d"]  = function(date)            { return lpad(this["%-d"](date)); };            
            this["%-d"] = function(date)            { return date.getDate(); };
            this["%H"]  = function(date)            { return lpad(this['%-H'](date)); };
            this["%-H"] = function(date)            { return date.getHours(); };
            this["%I"]  = function(date)            { return lpad(this["%-I"](date)); };
            this["%-I"] = function(date)            { return (this["%-H"](date) % 12) || 12; };
            this["%m"]  = function(date)            { return lpad(this["%-m"](date)); };
            this["%-m"] = function(date)            { return date.getMonth() + 1; };
            this["%M"]  = function(date)            { return lpad(date.getMinutes()); };
            this["%p"]  = function(date)            { return getMeridian(date); };
            this["%P"]  = function(date)            { return this["%p"](date).toUpperCase(); };
            this["%S"]  = function(date)            { return lpad(date.getSeconds()); };
            this["%y"]  = function(date)            { return this["%Y"](date) % 100; };
            this["%Y"]  = function(date)            { return date.getFullYear(); };
        },
        
        format: function(date, format, locale) {
            format = format || "";
            
            var formatParts = format.match(dateFormatMatcher),
                result      = format,
                part;
                
            while(format && formatParts.length) {
                part    = formatParts.pop();
                result  = result.replace(part, this.getterFns[part](date, locale));
            }
            return result;
        },
        
        hasTimePart: function(format) {
            return format && !!format.match(this.timePartMatcher);
        },
        
        isTwelveHourFormat: function(format) {
            return format && !!format.match(twelveHourMatcher);
        }
    };
    
    // ----------------------------------------------------------------------------
    // Date Parser
    // ----------------------------------------------------------------------------
    
    DatetimePicker.Parser = {
        matcherFns: new function() {
            var digitMatcherFnNames = $w("%d %-d %H %-H %I %-I %m %-m %M %S %y %Y"),
                nextDigitsMatcher   = /(\d+)/,
                meridianMatcher     = /([ap]m)/i,
                orCaptureGroup      = function(str) { return "(" +str.join("|")+ ")"; };
                
            this["%a"]  = function(locale) { return new RegExp(orCaptureGroup(locale.daysShort),    "i"); };
            this["%A"]  = function(locale) { return new RegExp(orCaptureGroup(locale.days),         "i"); };
            this["%b"]  = function(locale) { return new RegExp(orCaptureGroup(locale.monthsShort),  "i"); };
            this["%B"]  = function(locale) { return new RegExp(orCaptureGroup(locale.months),       "i"); };
            this["%p"]  = function()       { return meridianMatcher; };
            this["%P"]  = function()       { return meridianMatcher; };
            
            // generate the digit matchers
            for(var i=0, n=digitMatcherFnNames.length; i<n; i++) {
                this[digitMatcherFnNames[i]] = function() { return nextDigitsMatcher; };
            }
        },
        
        setterFns: new function() {
            var inStringArray = function(value, strings) {
                var elementsToLower = function(str) { return str.toLowerCase(); };
                return $.inArray(value.toLowerCase(), $.map(strings, elementsToLower));
            };
            
            // There is no setDay method on Date (not that there should be), so we'll do nothing.
            this["%a"]  = this["%A"]    = $.noop; 
            
            // Locale dependent setters
            this["%b"]  = function(date, value, locale) { date.setMonth(inStringArray(value, locale.monthsShort)); }; 
            this["%B"]  = function(date, value, locale) { date.setMonth(inStringArray(value, locale.months)); }; 
            
            this["%d"]  = this["%-d"]   = function(date, value) { date.setDate(value); }; 
            this["%H"]  = this["%-H"]   = function(date, value) { date.setHours(value); }; 
            this["%I"]  = this["%-I"]   = function(date, value) { date.setHours(value % 12); }; 
            this["%m"]  = this["%-m"]   = function(date, value) { date.setMonth(value - 1); }; 
            
            this["%M"]  = function(date, value) { date.setMinutes(value); }; 
            
            // am/pm
            this["%p"]  = this["%P"]    = function(date, value) { 
                value.toLowerCase() == "pm" && date.setHours(date.getHours() + 12); 
            };
             
            this["%S"]  = function(date, value) { date.setSeconds(value); }; 
            this["%y"]  = function(date, value) { date.setFullYear(parseInt(value) + 2000); }; 
            this["%Y"]  = function(date, value) { date.setFullYear(value); }; 
        },
        
        // order of setter invocation precedence: high to low.
        setterPrecendence: new function() {
            this["%Y"] = this["%y"]                             = 1;
            this["%m"] = this["%-m"] = this["%B"] = this["%b"]  = 2;
            this["%d"] = this["%-d"]                            = 3;
            this["%H"] = this["%-H"]                            = 4;
            this["%I"] = this["%-I"]                            = 5;
            this["%P"] = this["%p"]                             = 6;
            this["%M"]                                          = 7;
            this["%S"]                                          = 8;
            this["%A"] = this["%a"]                             = 9;
        },
        
        parse: function(strDate, format, locale) {
            strDate = strDate   || "";
            format  = format    || "";
            
            var formatParts     = format.match(dateFormatMatcher),
                checkFormat     = strDate,
                partPrecedence  = this.setterPrecendence,
                result          = new Date(),
                values          = [],
                part, partMatcher, value;
            
            // First pass: extract the values from the string, that correspond to the
            // format parts.
            while(format && formatParts.length) {
                part        = formatParts.shift();
                partMatcher = this.matcherFns[part](locale);
                checkFormat = checkFormat.replace(partMatcher, part);
                
                values.push([part, RegExp.$1]);
            }
            
            if(checkFormat !== format) {
                throw new Error("The supplied datetime string does not match the supplied format.");
            }
            
            // sort the values by order of precedence
            values = values.sort(function(a,b) { return partPrecedence[a[0]] - partPrecedence[b[0]]; });
            
            // For the time-parts, we'll start from zero, and work from there.
            result.setHours(0,0,0,0);
            
            // Second pass: set values on the result date, in order of precedence.
            for(var i=0, n=values.length; i<n; i++) {
                value = values[i];
                
                this.setterFns[value[0]](result, value[1], locale);
            }
            return result;
        }
    };
    
    // ----------------------------------------------------------------------------
    // Default Locale 
    // ----------------------------------------------------------------------------
    
    DatetimePicker.locales = {
        "en-US": {
            days:           ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort:      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            daysMin:        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            months:         ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort:    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        }
    };
    
    // ----------------------------------------------------------------------------
    // The Datetime Picker Function
    // ----------------------------------------------------------------------------
    
    $.fn.datetimePicker = function(options) {
        options = options || {};
        
        return $(this).each(function() {
            new DatetimePicker(this, options);
        });
    };
    
    // Provide access to the implementation.
    $.fn.datetimePicker.Constructor = DatetimePicker;
    
})(jQuery);