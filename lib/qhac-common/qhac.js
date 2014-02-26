// Interfaces for dealing with different types of data


// CryptoJS methods
var CryptoJS;

/** Iterates through all properties that belong to an object. */
var eachOwnProperty = function (o, f) {
    for (var k in o)
        if (Object.prototype.hasOwnProperty.call(o, k))
            f(k, o[k]);
};

/** Map through all properties that belong to an object, returning an array.. */
var mapOwnProperties = function (o, f) {
    var newList = [];

    for (var k in o)
        if (Object.prototype.hasOwnProperty.call(o, k))
            newList[newList.length] = f(k, o[k]);

    return newList;
};
// Aliases for common DOM traversal functions



HTMLElement.prototype.find = HTMLElement.prototype.querySelectorAll;

HTMLElement.prototype.attr = HTMLElement.prototype.getAttribute;

HTMLElement.prototype.findClass = HTMLElement.prototype.getElementsByClassName;

HTMLElement.prototype.findTag = HTMLElement.prototype.getElementsByTagName;

// use Sizzle if necessary
if (typeof HTMLElement.prototype.querySelectorAll === 'undefined' && typeof Sizzle !== 'undefined') {
    var Sizzle;

    HTMLElement.prototype.find = function (sel) {
        return Sizzle(sel, this);
    };

    HTMLElement.prototype.findClass = function (cls) {
        return Sizzle('.' + cls, this);
    };

    HTMLElement.prototype.findTag = HTMLElement.prototype.find;
}

NodeList.prototype.splice = function (idx) {
    var newList = [];

    for (var i = idx; i < this.length; i++) {
        newList[newList.length] = this[i];
    }

    return newList;
};

NodeList.prototype.map = function (f) {
    var newList = [];

    for (var i = 0; i < this.length; i++) {
        newList[i] = f(this[i]);
    }

    return newList;
};

NodeList.prototype.toArray = function () {
    var newList = [];

    for (var i = 0; i < this.length; i++) {
        newList[i] = this[i];
    }

    return newList;
};
/// <reference path='data.ts'/>
/// <reference path='query.ts'/>
var Districts;
(function (Districts) {
    /** Round Rock Independent School District */
    Districts.roundrock = {
        name: 'Round Rock ISD',
        driver: 'gradespeed',
        examWeight: 15,
        gpaOffset: 1,
        columnOffsets: {
            title: 0,
            grades: 2
        },
        classGradesRequiresAverageLoaded: true,
        api: {
            login: {
                url: 'https://accesscenter.roundrockisd.org/homeaccess/default.aspx',
                method: 'GET',
                makeQuery: function (u, p, state) {
                    return ({
                        '__VIEWSTATE': state.viewstate,
                        '__EVENTVALIDATION': state.eventvalidation,
                        'ctl00$plnMain$txtLogin': u,
                        'ctl00$plnMain$txtPassword': p,
                        '__EVENTTARGET': null,
                        '__EVENTARGUMENT': null,
                        'ctl00$strHiddenPageTitle': null,
                        'ctl00$plnMain$Submit1': 'Log In'
                    });
                }
            },
            disambiguate: {
                url: 'https://accesscenter.roundrockisd.org/homeaccess/Student/DailySummary.aspx',
                method: 'GET',
                isRequired: function (dom) {
                    return !!dom.find('#ctl00_plnMain_dgStudents').length;
                },
                makeQuery: function (id, state) {
                    return ({
                        'student_id': id
                    });
                },
                getDisambiguationChoices: (function (dom) {
                    return dom.find('#ctl00_plnMain_dgStudents .ItemRow a, #ctl00_plnMain_dgStudents .AlternateItemRow a').map(function (a) {
                        return ({
                            name: a.innerText,
                            id: a.attr('href').match(/\?student_id=(\d+)/)[1]
                        });
                    });
                })
            },
            grades: {
                url: 'https://accesscenter.roundrockisd.org/homeaccess/Student/Gradespeed.aspx?target=https://gradebook.roundrockisd.org/pc/displaygrades.aspx',
                method: 'GET'
            },
            classGrades: {
                url: 'https://gradebook.roundrockisd.org/pc/displaygrades.aspx',
                method: 'GET',
                makeQuery: function (hash, state) {
                    return ({
                        data: hash
                    });
                }
            },
            parseStudentInfo: function ($dom, id) {
                return {
                    name: $dom.findClass('StudentName')[0].innerText,
                    school: $dom.find('.StudentHeader')[0].innerText.match(/\((.*)\)/)[1],
                    id: id
                };
            }
        }
    };

    /** Austin Independent School District */
    Districts.austin = {
        name: 'Austin ISD',
        driver: 'gradespeed',
        examWeight: 25,
        gpaOffset: 0,
        columnOffsets: {
            title: 1,
            grades: 3
        },
        classGradesRequiresAverageLoaded: false,
        api: {
            login: {
                url: 'https://gradespeed.austinisd.org/pc/default.aspx?DistrictID=227901',
                method: 'GET',
                makeQuery: function (u, p, state) {
                    return ({
                        "__EVENTTARGET": null,
                        "__EVENTARGUMENT": null,
                        "__LASTFOCUS": null,
                        "__VIEWSTATE": state.viewstate,
                        "__scrollLeft": 0,
                        "__scrollTop": 0,
                        "ddlDistricts": null,
                        "txtUserName": u,
                        "txtPassword": p,
                        "ddlLanguage": "en",
                        "btnLogOn": "Log On"
                    });
                }
            },
            disambiguate: {
                url: 'https://gradespeed.austinisd.org/pc/ParentMain.aspx',
                method: 'POST',
                isRequired: function (dom) {
                    return !!dom.find('#_ctl0_ddlStudents').length;
                },
                makeQuery: function (id, state) {
                    return ({
                        '__EVENTTARGET': '_ctl0$ddlStudents',
                        '__EVENTARGUMENT': null,
                        '__LASTFOCUS': null,
                        '__VIEWSTATE': state.viewstate,
                        '__scrollLeft': 0,
                        '__scrollTop': 0,
                        '__EVENTVALIDATION': state.eventvalidation,
                        '__RUNEVENTTARGET': null,
                        '__RUNEVENTARGUMENT': null,
                        '__RUNEVENTARGUMENT2': null,
                        '_ctl0:ddlStudents': id
                    });
                },
                getDisambiguationChoices: function (dom) {
                    return (dom.find('#_ctl0_ddlStudents option').map(function (o) {
                        return ({
                            name: o.innerText,
                            id: o.attr('value')
                        });
                    }));
                }
            },
            grades: {
                url: 'https://gradespeed.austinisd.org/pc/ParentStudentGrades.aspx',
                method: 'GET'
            },
            classGrades: {
                url: 'https://gradespeed.austinisd.org/pc/ParentStudentGrades.aspx',
                method: 'GET',
                makeQuery: function (hash, state) {
                    return ({
                        data: hash
                    });
                }
            },
            parseStudentInfo: function ($dom, id) {
                return ({
                    name: $dom.findClass('StudentName')[0].innerText,
                    school: $dom.findClass('DistrictName')[0].findTag('span')[0].innerText.split('-')[1].substr(1),
                    id: id
                });
            }
        }
    };
})(Districts || (Districts = {}));
/** Returns only the numeric elements of an array. */
Array.prototype.numerics = function () {
    return this.filter(function (x) {
        return !actuallyIsNaN(x);
    });
};

/** Adds up the numeric elements of an array. */
Array.prototype.sum = function () {
    var numerics = this.numerics();
    if (numerics.length === 0)
        return NaN;
    return numerics.reduce(function (x, y) {
        return x + y;
    });
};

/** Returns the average of the numeric elements of an array. */
Array.prototype.average = function () {
    var numerics = this.numerics();
    if (numerics.length === 0)
        return NaN;
    return numerics.sum() / numerics.length;
};

/** A map with two arrays in parallel. */
Array.prototype.pmap = function (otherArray, f) {
    if (this.length !== otherArray.length)
        throw new Error('Array length mismatch.');

    var newList = [];
    for (var i = 0; i < this.length; i++)
        newList[i] = f(this[i], otherArray[i]);

    return newList;
};

/** Returns the weighted average of the numeric elements of an array. */
Array.prototype.weightedAverage = function (weights) {
    var numerics = this.numerics();
    var weightNums = weights.numerics();

    if (numerics.length !== weightNums.length || numerics.length === 0)
        return NaN;

    return numerics.pmap(weightNums, function (x, y) {
        return x * y;
    }).sum() / weightNums.sum();
};

/** Flattens an array of arrays into an array. */
Array.prototype.flatten = function () {
    var newList = [];

    this.forEach(function (x) {
        if (x.length)
            x.forEach(function (y) {
                return newList[newList.length] = y;
            });
    });

    return newList;
};

/** Returns a list of natural numbers in the form [0, 1, 2, ...] of the given length. */
var upto = function (n) {
    var list = [];

    for (var i = 0; i < n; i++) {
        list[i] = i;
    }

    return list;
};

/** Alternative to isNaN. Guarantees that any value that this function returns false for
can be used in numeric calculations without a hitch. */
function actuallyIsNaN(x) {
    return isNaN(x) || x === null || typeof x === undefined;
    // anything else I missed?
}
/// <reference path='data.ts'/>
/// <reference path='qmath.ts'/>
var GPACalc;
(function (GPACalc) {
    var DEFAULT_GPA_PRECISION = 4;

    /**
    * Finds the grade point from a grade. To find the unweighted grade point,
    * specify offset = 0. To find weighted on 5.0 scale, specify offset = 1. To
    * find weighted on 6.0 scale, specify offset = 2.
    */
    function gradePoint(grade, offset) {
        if (isNaN(grade))
            return NaN;
        if (grade < 70)
            return 0;
        return Math.min((grade - 60) / 10, 4) + offset;
    }

    /** Calculates the unweighted grade point average of a list of courses. */
    function unweighted(grades) {
        return grades.map(function (x) {
            return x.semesters.map(function (y) {
                return gradePoint(y.average, 0);
            });
        }).flatten().average();
    }
    GPACalc.unweighted = unweighted;

    /**
    * Calculates the weighted grade point average of a list of courses, given a
    * list of courses that should be treated as honors and an offset to add.
    */
    function weighted(grades, honors, offset) {
        return grades.map(function (x) {
            var offset1 = offset + ((honors.indexOf(x.title) == -1) ? 0 : 1);
            return x.semesters.map(function (y) {
                return gradePoint(y.average, offset1);
            });
        }).flatten().average();
    }
    GPACalc.weighted = weighted;
})(GPACalc || (GPACalc = {}));
/// <reference path='data.ts'/>
/// <reference path='qmath.ts'/>
var GradeCalc;
(function (GradeCalc) {
    /** Calculates a semester average from the cycles and exam grade provided */
    function semesterAverage(district, semester) {
        // get a list of all cycle averages by mapping arrays and crazy stuff like that
        var cycles = semester.cycles.map(function (c) {
            return c.average;
        }).numerics();

        var cycleAvg, cycleWeight, examGrade, examWeight;

        // calculate the cycle grades
        cycleAvg = cycles.average();
        cycleWeight = (100 - district.examWeight) * cycles.length / semester.cycles.length;

        // calculate the exam grade
        if (!semester.examIsExempt) {
            examGrade = semester.examGrade;

            // set the weight to NaN to ensure weighted average doesn't complain about
            // array length mismatch if there is no exam grade
            examWeight = actuallyIsNaN(examGrade) ? NaN : district.examWeight;
        }

        // take the weighted average of cycle and exam
        return [cycleAvg, examGrade].weightedAverage([cycleWeight, examWeight]);
    }
    GradeCalc.semesterAverage = semesterAverage;

    /** Calculates a cycle average given a ClassGrades object. Reads the category average
    and bonus by category. */
    function cycleAverage(grades) {
        var filteredCategories = grades.categories.filter(function (c) {
            return !actuallyIsNaN(c.average);
        });

        return +filteredCategories.map(function (c) {
            return c.average;
        }).weightedAverage(filteredCategories.map(function (c) {
            return c.weight;
        })) + grades.categories.map(function (c) {
            return c.bonus;
        }).numerics().sum();
    }
    GradeCalc.cycleAverage = cycleAverage;

    /** Calculates a category average from a list of assignments */
    function categoryAverage(assignments) {
        var filteredAssignments = assignments.filter(function (a) {
            return !a.extraCredit && !actuallyIsNaN(a.ptsEarned) && a.note.indexOf('(Dropped)') === -1;
        });

        return +filteredAssignments.map(function (a) {
            return a.ptsEarned * 100 / a.ptsPossible;
        }).weightedAverage(filteredAssignments.map(function (a) {
            return a.weight;
        }));
    }
    GradeCalc.categoryAverage = categoryAverage;

    /** Calculates the total bonus from extra credit assignments in a category to
    add to the class grade average. */
    function categoryBonuses(assignments) {
        // include only extra credit assignments with a grade entered
        var ecAssignments = assignments.filter(function (a) {
            return a.extraCredit && !actuallyIsNaN(a.ptsEarned);
        });

        // add up points earned
        return ecAssignments.map(function (a) {
            return a.ptsEarned;
        }).sum();
    }
    GradeCalc.categoryBonuses = categoryBonuses;
})(GradeCalc || (GradeCalc = {}));
/// <reference path='data.ts'/>
/// <reference path='qmath.ts'/>
/// <reference path='query.ts'/>
/// <reference path='gradecalc.ts'/>
// This is the GradeSpeed version. In the future, we will need to implement a
// corresponding txConnect version.
var GradeParser;
(function (GradeParser) {
    var EXTRA_CREDIT_REGEX = /^extra credit$|^ec$/i;
    var EXTRA_CREDIT_NOTE_REGEX = /extra credit/i;
    var GRADE_CELL_URL_REGEX = /\?data=([\w\d%]*)/;

    function getCourseIdFromHash(hash) {
        return hash.split('|')[3];
    }

    function parseCycle(district, $cell, idx) {
        // find a link, if any
        var $link = $cell.findTag('a');

        // if there is no link, the cell is empty; return empty values
        if (!$link.length)
            return { index: idx, average: NaN, urlHash: undefined };

        // find a grade
        var average = parseInt($link[0].innerText);
        var urlHash = decodeURIComponent(GRADE_CELL_URL_REGEX.exec($link[0].attr('href'))[1]);

        // return it
        return {
            index: idx,
            average: average,
            urlHash: urlHash
        };
    }

    function parseSemester(district, $cells, idx, semParams) {
        // parse cycles
        var cycles = [];
        for (var i = 0; i < semParams.cyclesPerSemester; i++) {
            cycles[i] = parseCycle(district, $cells[i], i);
        }

        // parse exam grade
        var $exam = $cells[semParams.cyclesPerSemester];
        var examGrade = NaN, examIsExempt = false;
        if ($exam.innerText === '' || $exam.innerText === '&nbsp;') {
        } else if ($exam.innerText === 'EX' || $exam.innerText === 'Exc')
            examIsExempt = true;
        else
            examGrade = parseInt($exam.innerText);

        // parse semester average
        // TODO: calculate semester average instead of parsing it? because
        // GradeSpeed sometimes messes up
        var semesterAverage = parseInt($cells[semParams.cyclesPerSemester + 1].innerText);

        // return a semester
        return {
            index: idx,
            average: semesterAverage,
            examGrade: examGrade,
            examIsExempt: examIsExempt,
            cycles: cycles
        };
    }

    function findCourseNum(district, $cells) {
        for (var i = district.columnOffsets.grades; i < $cells.length; i++) {
            var $links = $cells[i].findTag('a');
            if ($links.length !== 0) {
                return getCourseIdFromHash(atob(decodeURIComponent($links[0].attr('href').split('data=')[1])));
            }
        }

        // There is no course ID. Return nothing.
        return null;
    }

    function parseCourse(district, $row, semParams) {
        // find the cells in this row
        var $cells = $row.findTag('td');

        // find the teacher name and email
        var $teacherCell = $row.findClass('EmailLink')[0];

        // get the course number
        var courseNum = findCourseNum(district, $cells);
        var courseId = courseNum === null ? null : CryptoJS.SHA1(courseNum).toString();

        // parse semesters
        var semesters = [];
        for (var i = 0; i < semParams.semesters; i++) {
            // get cells for the semester
            var $semesterCells = [];

            // find the cells that are pertinent to this semester
            // $semesterCells becomes [cycle, cycle, ... , cycle, exam, semester] after filtering
            var cellOffset = district.columnOffsets.grades + i * (semParams.cyclesPerSemester + 2);
            for (var j = 0; j < semParams.cyclesPerSemester + 2; j++)
                $semesterCells[j] = $cells[cellOffset + j];

            // parse the semester
            semesters[i] = parseSemester(district, $semesterCells, i, semParams);
        }

        return {
            title: $cells[district.columnOffsets.title].innerText,
            teacherName: $teacherCell.innerText,
            teacherEmail: $teacherCell.attr('href').substr(7),
            courseId: courseId,
            semesters: semesters
        };
    }

    /** Gets information for all courses */
    function parseAverages(district, doc) {
        // set up DOM for parsing
        var $dom = document.createElement('div');
        $dom.innerHTML = doc;

        // find the grade table
        var $gradeTable = $dom.find('.DataTable')[0];

        // make semester parameters
        var $headerCells = $gradeTable.find('tr.TableHeader')[0].find('th');
        var sem = parseInt($headerCells[$headerCells.length - 1].innerText.match(/\d+/)[0]);
        var cyc = parseInt($headerCells[$headerCells.length - 3].innerText.match(/\d+/)[0]) / sem;
        var semParams = { semesters: sem, cyclesPerSemester: cyc };

        // find each course
        var $rows = $gradeTable.find('tr.DataRow, tr.DataRowAlt');

        // parse each course
        return $rows.map(function (r) {
            return parseCourse(district, r, semParams);
        });
    }
    GradeParser.parseAverages = parseAverages;

    /** Gets the name of the current student. */
    function getStudentName(district, doc) {
        var $dom = document.createElement('div');
        $dom.innerHTML = doc;
        return $dom.findClass('StudentName')[0].innerText;
    }
    GradeParser.getStudentName = getStudentName;

    function parseAssignment($row, is100Pt, catId) {
        // retrieve an element from the row and get its inner text
        var getText = function (cl) {
            return $row.find('.' + cl)[0].innerText;
        };

        // get data
        var title, dueDate, note, ptsEarned, ptsEarnedNum, ptsPossNum, weight;
        var title = getText('AssignmentName');
        var dueDate = getText('DateDue');
        var note = getText('AssignmentNote');
        var ptsEarned = getText('AssignmentGrade');
        var ptsPossNum = is100Pt ? 100 : parseInt(getText('AssignmentPointsPossible'));

        // Retrieve both the points earned and the weight of the assignment. Some teachers
        // put in assignments with weights; if so, they look like this:
        //     88x0.6
        //     90x0.2
        //     100x0.2
        // The first number is the number of points earned on the assignment; the second is
        // the weight of the assignment within the category.
        // If the weight is not specified, it is assumed to be 1.
        if (ptsEarned.indexOf('x') === -1) {
            ptsEarnedNum = parseFloat(ptsEarned);
            weight = 1;
        } else {
            var ptsSplit = ptsEarned.split('x');
            if (actuallyIsNaN(ptsSplit[0]) && actuallyIsNaN(ptsSplit[1])) {
                ptsEarnedNum = NaN;
                weight = 1;
            } else {
                ptsEarnedNum = parseFloat(ptsSplit[0]);
                weight = parseFloat(ptsSplit[1]);
            }
        }

        // generate the assignment ID
        var assignmentId = CryptoJS.SHA1(catId + '|' + title).toString();

        // Guess if the assignment is extra credit or not. GradeSpeed doesn't exactly
        // just tell us if an assignment is extra credit or not, but we can guess
        // from the assignment title and the note attached.
        // If either contains something along the lines of 'extra credit', we assume
        // that it is extra credit.
        var extraCredit = EXTRA_CREDIT_REGEX.test(title) || EXTRA_CREDIT_NOTE_REGEX.test(note);

        return {
            id: assignmentId,
            title: title,
            date: dueDate,
            ptsEarned: ptsEarnedNum,
            ptsPossible: ptsPossNum,
            weight: weight,
            note: note,
            extraCredit: extraCredit
        };
    }

    /** Adds up all of the bonus points in the list of assignments given.
    * TODO: put this in GradeEditor
    */
    function totalBonuses(assignments) {
        return assignments.map(function (a) {
            return a.extraCredit ? a.ptsEarned : 0;
        }).sum();
    }

    function parseCategory(district, catName, $cat, courseId) {
        // Try to retrieve a weight for each category. Since we have to support IB-MYP grading,
        // category weights are not guaranteed to add up to 100%. However, regardless of which
        // weighting scheme we are using, grade calculations should be able to use the weights
        // as they are parsed below.
        var catNameMatches = catName.innerText.match(/^(.*) - (\d+)%$/);
        if (catNameMatches === null) {
            catNameMatches = catName.innerText.match(/^(.*) - Each assignment counts (\d+)/);
        }

        // Some teachers don't put their assignments out of 100 points. Check if this is the case.
        var is100Pt = !$cat.find('td.AssignmentPointsPossible').length;

        // Find all of the rows in this category.
        var $rows = $cat.findTag('tr');

        // Find all of the assignments.
        var $assignments = $cat.find('tr.DataRow, tr.DataRowAlt');

        // Find the average cell.
        var $averageRow = $rows[$rows.length - 1].findTag('td');
        var $averageCell;

        for (var i = 0; i < $averageRow.length; i++) {
            if ($averageRow[i].innerText.indexOf('Average') !== -1) {
                $averageCell = $averageRow[i + 1];
                break;
            }
        }

        // generate category ID
        var catId = CryptoJS.SHA1(courseId + '|' + catNameMatches[1]).toString();

        // parse assignments
        var assignments = $assignments.map(function (a) {
            return parseAssignment(a, is100Pt, catId);
        });

        return {
            id: catId,
            title: catNameMatches[1],
            weight: parseInt(catNameMatches[2]),
            average: parseFloat($averageCell.innerText),
            bonus: GradeCalc.categoryBonuses(assignments),
            assignments: assignments
        };
    }

    /** Gets information for a single cycle */
    function parseClassGrades(district, doc, urlHash, semesterIndex, cycleIndex) {
        // set up DOM for parsing
        var $dom = document.createElement('div');
        $dom.innerHTML = doc;

        // class name cell contains title and period
        // this array will contain something like this: ['Class Title (Period xx)', 'Class Title', 'xx']
        var classNameMatches = $dom.find('h3.ClassName')[0].innerText.match(/(.*) \(Period (\d+)\)/);

        // get category names
        var catNames = $dom.find('span.CategoryName');
        var $categories = $dom.find('.DataTable').splice(1);

        // generate course ID
        var courseId = CryptoJS.SHA1(atob(decodeURIComponent(urlHash))).toString();

        return {
            title: classNameMatches[1],
            urlHash: urlHash,
            period: parseInt(classNameMatches[2], 10),
            semesterIndex: semesterIndex,
            cycleIndex: cycleIndex,
            average: parseInt($dom.find('.CurrentAverage')[0].innerText.match(/\d+/)[0]),
            categories: $categories.pmap(catNames.toArray(), function (c, n) {
                return parseCategory(district, n, c, courseId);
            })
        };
    }
    GradeParser.parseClassGrades = parseClassGrades;

    // only call this function on the grades page
    function parseStudentInfo(district, doc, id) {
        var $dom = document.createElement('div');
        $dom.innerHTML = doc;
        return district.api.parseStudentInfo($dom, id);
    }
    GradeParser.parseStudentInfo = parseStudentInfo;
})(GradeParser || (GradeParser = {}));
/// <reference path='data.ts'/>
/** A helper class for making XMLHttpRequests. */
var XHR = (function () {
    /** Creates a new XHR and returns itself for chaining */
    function XHR(method, url) {
        if (method !== 'GET' && method !== 'POST')
            throw new Error('Unsupported HTTP request type: ' + method);

        this._xhr = new XMLHttpRequest();
        this._method = method;
        this._url = url;
        return this;
    }
    /** Calls 'f' with arguments if it is a function, otherwise does nothing. */
    XHR._maybeCall = function (f, _this, args) {
        if (typeof f === 'function')
            return f.apply(_this, args);
    };

    /** Encodes a parameter from a key/value pair. */
    XHR._encodeParameter = function (key, value) {
        // null -> empty string
        if (value === null)
            value = '';

        // encode
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    };

    /** Handles state changes in the backing XHR */
    XHR._stateChangeHandler = function (_this) {
        return function () {
            if (_this._xhr.readyState === 4) {
                if (_this._xhr.status === 200) {
                    XHR._maybeCall(_this._success, _this._xhr, [_this._xhr.responseText, _this._xhr.responseXML]);
                } else if (_this._xhr.status === 500) {
                    XHR._maybeCall(_this._fail, _this._xhr, [
                        new ErrorEvent('xhr', {
                            message: 'Internal Server Error',
                            error: {
                                message: 'Internal Servor Error',
                                description: 'Something went wrong on the server side.'
                            }
                        })
                    ]);
                }
            }
        };
    };

    /** Cretaes a parameter string from a hash of parameters. */
    XHR._createParamsString = function (params) {
        if (typeof params === 'undefined')
            return '';
        return mapOwnProperties(params, XHR._encodeParameter).join('&');
    };

    /** Sends a GET request with the specified parameters. */
    XHR.prototype._sendGet = function () {
        // only add ? if params exist
        var params = XHR._createParamsString(this._params);
        if (params !== '')
            params = '?' + params;

        // log
        console.log('XHR loading: ' + this._url + ' via GET');
        console.log('Params: ' + params);

        // send
        this._xhr.open('GET', this._url + params, true);
        this._xhr.onreadystatechange = XHR._stateChangeHandler(this);
        this._xhr.send(null);
    };

    /** Sends a POST request with the specified parameters. */
    XHR.prototype._sendPost = function () {
        // open url
        this._xhr.open('POST', this._url, true);
        this._xhr.onreadystatechange = XHR._stateChangeHandler(this);

        var paramString = XHR._createParamsString(this._params);

        console.log('XHR loading: ' + this._url + ' via POST');
        console.log('Params: ' + paramString);

        // send the proper header information along with the request
        this._xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        // send params
        this._xhr.send(paramString);
    };

    /** Sets the callback for when the request succeeds. */
    XHR.prototype.success = function (f) {
        this._success = f;
        return this;
    };

    /** Sets the callback for when the request fails. */
    XHR.prototype.fail = function (f) {
        this._fail = f;
        this._xhr.onerror = function (ev) {
            return XHR._maybeCall(f, this, [ev]);
        };
        return this;
    };

    /** Sets the parameters to be passed to the server. */
    XHR.prototype.params = function (params) {
        this._params = params;
        return this;
    };

    /** Sends an XHR */
    XHR.prototype.send = function () {
        if (this._method === 'GET')
            this._sendGet();
        else
            this._sendPost();
    };
    return XHR;
})();
/// <reference path='data.ts'/>
/// <reference path='xhr.ts'/>
var GradeRetriever;
(function (GradeRetriever) {
    // get the viewstate and eventvalidation on a page on GradeSpeed
    function getPageState($dom) {
        // gets the value of an element on the page
        function getAttr(id) {
            var $elem = $dom.find(id);
            if ($elem.length)
                return $elem[0].attr('value');
            else
                return null;
        }

        // return values parsed from the page
        return {
            viewstate: getAttr('#__VIEWSTATE'),
            eventvalidation: getAttr('#__EVENTVALIDATION'),
            eventtarget: getAttr('#__EVENTTARGET'),
            eventargument: getAttr('#__EVENTARGUMENT')
        };
    }

    /**
    * Logs into the GradeSpeed server of a district with specific login
    * information and callbacks.
    */
    function login(district, uname, pass, success, fail) {
        // get the login page
        new XHR('GET', district.api.login.url).success(do_login).fail(fail).send();

        // process the login page
        function do_login(doc) {
            // load the page DOM
            var $dom = document.createElement('div');
            $dom.innerHTML = doc;

            // load the page state
            var state = getPageState($dom);

            // construct a query
            var query = district.api.login.makeQuery(uname, pass, state);

            // perform login
            new XHR('POST', district.api.login.url).success(getDisambigChoices).fail(fail).params(query).send();
        }

        // return student choices if there are any
        function getDisambigChoices(doc) {
            // load the page DOM
            var $dom = document.createElement('div');
            $dom.innerHTML = doc;

            var state = getPageState($dom);

            // only return choices if there are any; the success callback should
            // detect whether the disambiguation choices array is null or not.
            if (district.api.disambiguate.isRequired($dom)) {
                var choices = district.api.disambiguate.getDisambiguationChoices($dom);
                XHR._maybeCall(success, null, [doc, $dom, choices, state]);
            } else {
                XHR._maybeCall(success, null, [doc, $dom, null, state]);
            }
        }
    }
    GradeRetriever.login = login;

    // select a student
    function disambiguate(district, studentID, state, success, fail) {
        // construct a query
        var query = district.api.disambiguate.makeQuery(studentID, state);

        // pass query to GradeSpeed
        new XHR(district.api.disambiguate.method, district.api.disambiguate.url).success(success).fail(fail).params(query).send();
    }
    GradeRetriever.disambiguate = disambiguate;

    function getAverages(district, success, fail) {
        new XHR('GET', district.api.grades.url).success(success).fail(fail).send();
    }
    GradeRetriever.getAverages = getAverages;

    function getClassGrades(district, urlHash, gradesPage, success, fail) {
        // GradeSpeed loads the page from a URL.
        if (district.driver === 'gradespeed') {
            new XHR('GET', district.api.classGrades.url).success(success).fail(fail).params(district.api.classGrades.makeQuery(urlHash, null)).send();
        } else if (district.driver === 'txconnect') {
            var $dom = document.createElement('div');
            $dom.innerHTML = gradesPage;
            var state = getPageState($dom);
            new XHR('GET', district.api.classGrades.url).success(success).fail(fail).params(district.api.classGrades.makeQuery(urlHash, state)).send();
        }
    }
    GradeRetriever.getClassGrades = getClassGrades;
})(GradeRetriever || (GradeRetriever = {}));
