describe("The DatetimePicker.Formatter", function() {
    var DatetimePicker  = $.fn.datetimePicker.Constructor,
        formatter       = DatetimePicker.Formatter,
        locale          = DatetimePicker.locales["en-US"];
    
    // ----------------------------------------------------------------------------
    // Value Functions
    // ----------------------------------------------------------------------------
    
    describe("getterFns with a date", function() {
        var getterFns   = formatter.getterFns,
            year        = 2012,
            month       = 8, // September
            day         = 7,
            hour        = 23,
            minute      = 45,
            second      = 30,
            date        = new Date(year, month, day, hour, minute, second);
        
        // Helper function to DRY up these tests
        var describeExpectationForFormat = function(expectedResult, format) {
            return describe("format " + format, function() {
               var result          = getterFns[format](date, locale);

               it("should equal '" +expectedResult+ "'", function() {
                   expect(result).toBe(expectedResult);
               });
            });
        };
        
        describeExpectationForFormat("Fri",         "%a");
        describeExpectationForFormat("Friday",      "%A");
        describeExpectationForFormat("Sep",         "%b");
        describeExpectationForFormat("September",   "%B");
        describeExpectationForFormat("07",          "%d");
        describeExpectationForFormat(day,           "%-d");
        describeExpectationForFormat("23",          "%H");
        describeExpectationForFormat(hour,          "%-H");
        describeExpectationForFormat("11",          "%I");
        describeExpectationForFormat(11,            "%-I");
        describeExpectationForFormat("09",          "%m");
        describeExpectationForFormat(9,             "%-m");
        describeExpectationForFormat("45",          "%M");
        describeExpectationForFormat("pm",          "%p");
        describeExpectationForFormat("PM",          "%P");
        describeExpectationForFormat("30",          "%S");
        describeExpectationForFormat(12,            "%y");
        describeExpectationForFormat(year,          "%Y");
    });
    
    // ----------------------------------------------------------------------------
    // Format Function
    // ----------------------------------------------------------------------------
    
    describe("the application of 'format' to a date", function() {
        describe("with format '%B %-d, %Y at %I:%M%p'", function() {
            var format          = "%B %-d, %Y at %I:%M%p",
                date            = new Date(1975, 11, 25, 0, 29),
                result          = formatter.format(date, format, locale),
                expectedResult  = "December 25, 1975 at 12:29am";
                
            it("should equal " + expectedResult, function() {
                expect(result).toBe(expectedResult);
            });
        });
        
        describe("with format '%m/%d/%y'", function() {
            var format          = "%m/%d/%y",
                date            = new Date(1977, 6, 12),
                result          = formatter.format(date, format, locale),
                expectedResult  = "07/12/77";
            
            it("should equal " + expectedResult, function() {
                expect(result).toBe(expectedResult);
            });
        });
        
        describe("with a null format", function() {
            var date            = new Date(),
                result          = formatter.format(date, null, locale),
                expectedResult  = "";
                
            it("should return an empty string", function() {
                expect(result).toBe(expectedResult);
            });
        });
    });
    
    // ----------------------------------------------------------------------------
    // Predicate Functions
    // ----------------------------------------------------------------------------
    
    describe("hasTimePart", function() {
        describe("when supplied the format '%A %B %-d, %Y'", function() {
            var format          = "%A %B %-d, %Y",
                result          = formatter.hasTimePart(format),
                expectedResult  = false;
                
            it("should return 'false'", function() {
                expect(result).toBe(expectedResult);
            });
        });
        
        describe("when supplied the format '%m/%d/%Y %-I:%M:%S", function() {
            var format          = "%m/%d/%Y %-I:%M:%S",
                result          = formatter.hasTimePart(format),
                expectedResult  = true;
                
            it("should return 'true'", function() {
                expect(result).toBe(expectedResult);
            });
        });
        
        describe("for each of the valid time formats:", function() {
            var formats         = "%H %-H %I %-I %M %p %P %S".split(/\s+/),
                expectedResult  = true,
                format, result;
            
            for(var i=0, n=formats.length; i<n; i++) {
                format  = formats[i];
                result  = formatter.hasTimePart(format);
                
                describe("..." + format, function() {
                    it("should be 'true'", function() {
                        expect(result).toBe(expectedResult);
                    });
                });
            }
        });
        
        describe("for each of the valid non-time formats:", function() {
            var formats         = "%a %A %b %B %d %-d %m %-m %y %Y".split(/\s+/),
                expectedResult  = false,
                format, result;
            
            for(var i=0, n=formats.length; i<n; i++) {
                format  = formats[i];
                result  = formatter.hasTimePart(format);
                
                describe("..." + format, function() {
                    it("should be 'false'", function() {
                        expect(result).toBe(expectedResult);
                    });
                });
            }
        });
    });
    
    describe("isTwelveHourFormat", function() {
        describe("when supplied the format '%H:%M:%S'", function() {
            var format          = "%H:%M:%S",
                result          = formatter.isTwelveHourFormat(format),
                expectedResult  = false;
                
            it("should return 'false'", function() {
                expect(result).toBe(expectedResult);
            });
        });
        
        describe("when supplied the format '%-I:%M%p'", function() {
            var format          = "%-I:%M%p",
                result          = formatter.isTwelveHourFormat(format),
                expectedResult  = true;
                
            it("should return 'true'", function() {
                expect(result).toBe(expectedResult);
            });
        });
    });
});