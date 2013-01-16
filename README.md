# bootstrap-simple-datetime-picker

__Note: This is a work-in-progress.  I'm very happy to accept pull-requests for enhancements and bug fixes, if you think this plugin could be improved.__

## Why another datetime picker?

* _Format Strings_: After years of specifying and parsing format strings that look like `MM/dd/YYYY`, I've found the `strtime` format style to allow for more robust formatting, and it's much simpler to parse.  So that previous format ends up looking like `%m/%d/%Y`.  It may not be as readable to non-programmers, then again, it's not intended for them.
* _Adaptive Layout_: I wanted a datetime picker that adapted its layout to reflect the needs specified by the date format string.  This means that if your date format string has no time parts, the picker will not render them.  Also, if your format string indicates 12-hour time, then a meridian selector is rendered.
* _Style_: This one is subjective, and I don't want to imply that other plugins exhibit poor style--I simply wanted a datetime picker that was easy for me to maintain, as maintaining this plugin is not my day job.
* _Self Improvement_: Lastly, I wanted to write a datetime picker to learn more about writing JQuery plugins, and as a means to refine my knowledge of working with dates and time (they're so weird!).

## Usage

TODO:

* Finish this readme.
* Add the ability to select a month and year.
* Add keyboard navigation of the calendar.
* Allow for `localeString`, `format`, and `minutesInterval` options to be specified as data attributes on the element.
* Tweak styling.