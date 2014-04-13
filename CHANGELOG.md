# Changelog

### 2.2.5

* Fix student selection for RRISD

### 2.2.4

* Fix compatibility for 10 Apr 2014 RRISD HAC update

### 2.2.3

* Fix typo

### 2.2.2

* Don't break on Austin ISD's cumulative GPA

### 2.2.1

* Fix bug that broke background updating if refresh interval was not set

## 2.2.0

* Include newer version of `qhac-common`
* Make all Round Rock ISD grade requests direct from client to GradeSpeed; credentials no longer touch our server at all

### 2.1.11

* Make close button work

### 2.1.10

* Fix exam weight in Austin ISD semester average calculation

### 2.1.9

* Add permission to allow making direct requests to Austin ISD

### 2.1.8

* Make requests directly to Austin ISD instead of going through our server

### 2.1.7

* Add another extra credit case.

### 2.1.6

* Always calculate semester average on the client to avoid Gradespeed messing up
* Handle extra credit correctly, assuming it counts toward six weeks average

### 2.1.5

* Revert stuff because I'm an idiot and pushed the wrong code

### 2.1.4

* Improve GPA Options panel, putting more GPA-related options in one place
* Slightly more handling of edge cases when communicating with HAC server

### 2.1.3

* Fix bug that broke background grade updating

### 2.1.2

* Add support for AISD-style weighted GPA
* Add header to GPA options
* Improve visuals on detailed grades view
* Allow tabbing across assignment and exam grade editors
* Fix initialization issues on the options page
* Fix quote citation bottom margin being too small on options page
* Fix login box being truncated vertically
* Add Muscula for error tracking
* More quotes

### 2.1.1

* Fix a regression that caused options page to be broken when upgrading to 2.1.0

### 2.1.0

* Add GPA calculator
* Add inspiring quotes to options page
* Rename "Asianness Level" to "Power Level"
* Remove High Expectations Asian Father reference

### 2.0.7

* Add support for 8 digit student IDs

### 2.0.6

* Fetch ads from server instead of hardcoding them
* Fix NaN when adding grade to empty category

### 2.0.5

* Fix automatic updating not working unless user changed options

### 2.0.4

* Fix logged out qHAC being CPU/network hog

### 2.0.3

* Fix user interactivity disabled on logging in

### 2.0.2

* Add JSDoc documentation

### 2.0.1

* Merge in ability to save grade data from 1.2.10

### 2.0.0

* Add ability to add new assignments
* Add new indicator for Offline Mode
* Add small indicators to show which grades have changed
* Change 'busy' spinner sprite
* Cache class grades for offline use and pre-loading to increse responsiveness
* Adjust and even out the column widths of assignment grades for readability
* Add color schemes
* Add special color for extra credit
* Render logo in canvas
* Other minor visual updates
* Handle invalid responses from HAC gracefully
* Only load one AJAX request at a time
* Completely rewrite options page
* Add option to show consolidated grade change notifications
* Add password protection (with cool animations! :D)
* Add support for Austin ISD users
* Enhance support for Grisham MS
* Migrate to jQuery 2.0

### 1.2.10

* Add ability to save all grade data

### 1.2.9

* Add tracking of background updates

### 1.2.8

* Fix CPU and network hog

### 1.2.7

* Add developer credit to Tristan Seifert (oops!)

### 1.2.6

* Add checkboxes to options page for more intuitive disabling of grade colorization and automatic refresh
* Add link to survey
* Refactor ad generation code

### 1.2.5

* Add tooltip showing original grade when editing a grade (via tipsy)
* Add "edited" notice to the header
* Highlight edited six-weeks averages in blue
* Limit six weeks and semester averages to between 0 and 100
* Fix colorising algorithm to handle extreme grades gracefully
* Allow editing of semester exam grades

### 1.2.4

* Add notice of workaround for Mountain Lion users potentially having scrolling issues

### 1.2.2

* Refactor code
* Change the way the scrolling shadow is calculated

### 1.2.1

* Add analytics for grade editing
* Hide "User-edited" notice when changing grade back to original value
* Fix formatting issues with grade editor
* Change the way the scrolling shadow is calculated
* Add extra credit case to grade calculation (does not cover all extra credit)

### 1.2.0

* Add ability to edit assignment grades

### 1.1.2

* Add ad for Sailesh

### 1.1.1

* Update overall grades when loading class grades

### 1.1.0

* Fix bugs
* Show version on options page
* Other options page tweaks

### 1.0.4

* Make orchestra booster ad work

### 1.0.2

* Add orchestra booster ad

### 1.0.1

* Add detailed Google Analytics code

### 1.0.0

* First official release