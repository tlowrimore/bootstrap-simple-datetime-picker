describe("The DatetimePicker.Parser", function() {
    var DatetimePicker  = $.fn.datetimePicker.Constructor,
        parser          = DatetimePicker.Parser,
        locale          = DatetimePicker.locales["en-US"];
        
    // ----------------------------------------------------------------------------
    // Matcher Functions
    // ----------------------------------------------------------------------------
    
    describe("for each matcher function:", function() {
        var matcherFns      = parser.matcherFns,
            daysShortExpr   = /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/i,
            daysExpr        = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i,
            monthsShortExpr = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
            monthsExpr      = /(January|February|March|April|May|June|July|August|September|October|November|December)/i,
            digitExpr       = /(\d+)/,
            meridianExpr    = /([ap]m)/i,
            expectations    = {
                "%a":   daysShortExpr,
                "%A":   daysExpr,
                "%b":   monthsShortExpr,
                "%B":   monthsExpr,
                "%p":   meridianExpr,
                "%P":   meridianExpr,
                "%d":   digitExpr,
                "%-d":  digitExpr, 
                "%H":   digitExpr,
                "%-H":  digitExpr, 
                "%I":   digitExpr,
                "%-I":  digitExpr, 
                "%m":   digitExpr,
                "%-m":  digitExpr, 
                "%M":   digitExpr,
                "%S":   digitExpr,
                "%y":   digitExpr,
                "%Y":   digitExpr
            },
            expectedResult;
            
        var describeExpectationForFormat = function(part, expectedResult, result) {
            describe("..." + part, function() {
                it("should return the RegExp '" +expectedResult+ "'", function() {
                    expect(result).toEqual(expectedResult);
                });
            });
        }
            
        for(var part in expectations) {
            expectedResult = expectations[part];
            describeExpectationForFormat(part, expectations[part], matcherFns[part](locale));
        }
    });
    
    // ----------------------------------------------------------------------------
    // Setter Functions
    // ----------------------------------------------------------------------------
    
    describe("for each setter function:", function() {
        var setterFns   = parser.setterFns,
            result, expectedResult;
            
        beforeEach(function() {
            result          = new Date();
            expectedResult  = new Date(result);
        });
        
        describe("...%a", function() {
            var day = 5;
            
            beforeEach(function() {
                setterFns["%a"](result, day);
            });
            
            it("should perform a noop on the date", function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%A", function() {
            var day = 5;
            
            beforeEach(function() {
                setterFns["%a"](result, day);
            });
            
            it("should perform a noop on the date", function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%b", function() {
            var expectedMonth   = ((new Date()).getMonth() + 1) % 12,
                monthName       = locale.monthsShort[expectedMonth];
            
            beforeEach(function() {
                setterFns["%b"](result, monthName, locale);
                expectedResult.setMonth(expectedMonth);
            });
            
            it("should set the month to '" +monthName+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%B", function() {
            var expectedMonth   = ((new Date()).getMonth() + 1) % 12,
                monthName       = locale.months[expectedMonth];
            
            beforeEach(function() {
                setterFns["%B"](result, monthName, locale);
                expectedResult.setMonth(expectedMonth);
            });
            
            it("should set the month to '" +monthName+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%d", function() {
            var expectedDate    = (((new Date()).getDate() + 1) % 9).toString().replace(/^(\d)$/, "0$1");
            
            beforeEach(function() {
                setterFns["%d"](result, expectedDate);
                expectedResult.setDate(expectedDate);
            });
            
            it("should set the date to '" +expectedDate+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%-d", function() {
            var expectedDate    = ((new Date()).getDate() + 1) % 28;
            
            beforeEach(function() {
                setterFns["%-d"](result, expectedDate);
                expectedResult.setDate(expectedDate);
            });
            
            it("should set the date to '" +expectedDate+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%H", function() {
            var expectedHour = (((new Date()).getHours() + 1) % 9).toString().replace(/^(\d)$/, "0$1");
            
            beforeEach(function() {
                setterFns["%H"](result, expectedHour);
                expectedResult.setHours(expectedHour);
            });
            
            it("should set the hour to '" +expectedHour+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%-H", function() {
            var expectedHour = ((new Date()).getHours() + 1) % 24;
            
            beforeEach(function() {
                setterFns["%-H"](result, expectedHour);
                expectedResult.setHours(expectedHour);
            });
            
            it("should set the hour to '" +expectedHour+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%I", function() {
            var expectedHour = (((new Date()).getHours() + 1) % 9).toString().replace(/^(\d)$/, "0$1");
            
            beforeEach(function() {
                setterFns["%I"](result, expectedHour);
                expectedResult.setHours(expectedHour);
            });
            
            it("should set the hour to '" +expectedHour+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%-I", function() {
            var argHour         = Math.min((new Date()).getHours() + 12, 23),
                expectedHour    = argHour % 12;
            
            beforeEach(function() {
                setterFns["%-I"](result, argHour);
                expectedResult.setHours(expectedHour);
            });
            
            it("should set the hour to '" +expectedHour+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%m", function() {
            var argMonth        = "09",
                expectedMonth   = 8;
            
            beforeEach(function() {
                setterFns["%m"](result, argMonth);
                expectedResult.setMonth(expectedMonth);
            });
            
            it("should set the month to '" +expectedMonth+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%-m", function() {
            var argMonth        = 9,
                expectedMonth   = 8;
            
            beforeEach(function() {
                setterFns["%-m"](result, argMonth);
                expectedResult.setMonth(expectedMonth);
            });
            
            it("should set the month to '" +expectedMonth+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%M", function() {
            var expectedMinute = (((new Date()).getMinutes() + 1) % 9).toString().replace(/^(\d)$/, "0$1");
            
            beforeEach(function() {
                setterFns["%M"](result, expectedMinute);
                expectedResult.setMinutes(expectedMinute);
            });
            
            it("should set the hour to '" +expectedMinute+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%p", function() {
            var itShouldSetHour = function(meridian, hour, expectedHour) {
                beforeEach(function() {
                    setterFns["%I"](result, hour);
                    setterFns["%p"](result, meridian);
                    expectedResult.setHours(expectedHour);
                });
                
                it("should set the hour to '" +expectedHour+ "'", function() {
                    expect(result).toEqual(expectedResult);
                });
            };
            
            describe("when supplied 'am', where the date's hour is 11", function() {
                var argMeridian     = "am",
                    startHour       = 11,
                    expectedHour    = 11;
                
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
            
            describe("when supplied 'am', where the date's hour is 12", function() {
                var argMeridian     = "am",
                    startHour       = 12,
                    expectedHour    = 0;
                
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
            
            describe("when supplied 'pm', where the date's hour is 11", function() {
                var argMeridian     = "pm",
                    startHour       = 11,
                    expectedHour    = 23;
                    
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
            
            describe("when supplied 'pm', where the date's hour is 12", function() {
                var argMeridian     = "pm",
                    startHour       = 12,
                    expectedHour    = 12;
                    
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
        });
        
        describe("...%P", function() {
            var itShouldSetHour = function(meridian, hour, expectedHour) {
                beforeEach(function() {
                    setterFns["%I"](result, hour);
                    setterFns["%P"](result, meridian);
                    expectedResult.setHours(expectedHour);
                });
                
                it("should set the hour to '" +expectedHour+ "'", function() {
                    expect(result).toEqual(expectedResult);
                });
            };
            
            describe("when supplied 'AM', where the date's hour is 1", function() {
                var argMeridian     = "AM",
                    startHour       = 1,
                    expectedHour    = 1;
                
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
            
            describe("when supplied 'AM', where the date's hour is 12", function() {
                var argMeridian     = "AM",
                    startHour       = 12,
                    expectedHour    = 0;
                
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
            
            describe("when supplied 'PM', where the date's hour is 1", function() {
                var argMeridian     = "pm",
                    startHour       = 1,
                    expectedHour    = 13;
                    
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
            
            describe("when supplied 'PM', where the date's hour is 12", function() {
                var argMeridian     = "pm",
                    startHour       = 12,
                    expectedHour    = 12;
                    
                itShouldSetHour(argMeridian, startHour, expectedHour);
            });
        });
        
        describe("...%S", function() {
            var expectedSecond = (new Date().getSeconds() + 20) % 60;
            
            beforeEach(function() {
                setterFns["%S"](result, expectedSecond);
                expectedResult.setSeconds(expectedSecond);
            });
            
            it("should set the second to '" +expectedSecond+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%y", function() {
            var expectedYear    = (new Date()).getFullYear() - 1,
                argYear         = expectedYear % 100;
            
            beforeEach(function() {
                setterFns["%y"](result, argYear);
                expectedResult.setFullYear(expectedYear);
            });
            
            it("should set the year to '" +expectedYear+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
        
        describe("...%Y", function() {
            var expectedYear    = (new Date()).getFullYear() + 1;
            
            beforeEach(function() {
                setterFns["%Y"](result, expectedYear);
                expectedResult.setFullYear(expectedYear);
            });
            
            it("should set the year to '" +expectedYear+ "'",  function() {
                expect(result).toEqual(expectedResult);
            });
        });
    });
    
    // ----------------------------------------------------------------------------
    // Parse Function
    // ----------------------------------------------------------------------------
    
    describe("parse function", function() {
        var expectations = [
            [ "Jan 21, 2001 12:22am",   "%b %-d, %Y %-I:%M%p",  locale, new Date(2001, 0, 21, 0, 22) ],
            [ "09/07/1975 23:42:33",    "%m/%d/%Y %H:%M:%S",    locale, new Date(1975, 8, 7, 23, 42, 33) ],
            [ "10:55PM",                "%I:%M%P",              locale, (function() { var d = new Date(); d.setHours(22, 55, 0, 0); return d; })() ]
        ];
        
        var itShouldParseAndReturn = function(strDate, format, locale, expectedResult) {
            it("when supplied '" +strDate+ "' with format: '" +format+ "' it should return the date '" +expectedResult+ "'", function() {
                expect(parser.parse(strDate, format, locale)).toEqual(expectedResult);
            });
        }
        
        for(var i=0, n=expectations.length; i<n; i++) {
            itShouldParseAndReturn.apply(this, expectations[i]);
        }
    });
});