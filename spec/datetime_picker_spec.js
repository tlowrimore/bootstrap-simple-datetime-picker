describe("The DatetimePicker", function() {
    var DatetimePicker  = $.fn.datetimePicker.Constructor,
        element         = $("<input type='text'/>");
        
    describe("when constructed with empty options", function() {
        var instance        = new DatetimePicker(element, {}),
            expectations    = {
                "localeString":     "en-US",
                "format":           "%Y-%m-%d %H:%M",
                "minutesInterval":  5,
                "unparsable":       undefined,
                "$element":         $(element)
            },
            
            eachExpectation = function(prop, val) {
                it("should have a '" +prop+ "' of '" +val+ "'", function() {
                    expect(instance[prop]).toEqual(val);
                });
            };
        
        $.each(expectations, eachExpectation);
    });
    
    
});