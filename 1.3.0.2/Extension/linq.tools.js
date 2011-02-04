﻿/*--------------------------------------------------------------------------
* linq.tools.js - UtilityTools (linq.js Extension)
* ver 0.0.0.4 (Jun. 5th, 2009)
*
* created and maintained by neuecc <ils@neue.cc>
* licensed under Microsoft Public License(Ms-PL)
* http://neue.cc/
* http://linqjs.codeplex.com/
*--------------------------------------------------------------------------*/

// Namespace
if (typeof Linq == "undefined") Linq = {};
Linq.Tools = {}

/* String.Format */

// Overload:function(template, Object replacement)
// Overload:function(template, Array replacement)
// Overload:function(template, params args)
Linq.Tools.Template = function(template, replacement)
{
    var key;
    if (typeof replacement != "object")
    {
        key = E.Range(0, arguments.length - 1).ToString("|");
        replacement = E.From(arguments).Skip(1).ToArray();
    }
    else if (replacement instanceof Array)
    {
        key = E.Range(0, replacement.length).ToString("|");
    }
    else
    {
        key = E.From(replacement).Select("$.Key").ToString("|");
    }
    var regex = new RegExp("\{(" + key + ")\}", "g");
    return template.replace(regex, function(m, c) { return replacement[c] });
}

/* StringBuilder */

Linq.Tools.StringBuilder = function()
{
    this._array = [];
}
Linq.Tools.StringBuilder.Create = function()
{
    return new Linq.Tools.StringBuilder();
}
Linq.Tools.StringBuilder.prototype =
{
    Append: function(value)
    {
        this._array.push(value);
        return this;
    },

    AppendLine: function(value)
    {
        this._array.push(value);
        this._array.push("<br />");
        return this;
    },

    AppendFormat: function(template, replacement)
    {
        var format = Linq.Tools.Template.apply(null, arguments);
        this._array.push(format);
        return this;
    },

    Reverse: function()
    {
        this._array.reverse();
        return this;
    },

    ToString: function()
    {
        return this._array.join("");
    }
}

/* Stopwatch */

Linq.Tools.Stopwatch = function()
{
    this._startDate = null;
    this._elapsed = 0;
}
Linq.Tools.Stopwatch.Create = function()
{
    return new Linq.Tools.Stopwatch();
}
Linq.Tools.Stopwatch.StartNew = function()
{
    var sw = new Linq.Tools.Stopwatch();
    sw.Start();
    return sw;
}
Linq.Tools.Stopwatch.Bench = function(times, action)
{
    var sw = Linq.Tools.Stopwatch.StartNew();
    for (var i = 0; i < times; i++)
    {
        action();
    }
    return sw.Elapsed();
}
Linq.Tools.Stopwatch.prototype =
{
    Start: function()
    {
        this._startDate = new Date();
    },

    Stop: function()
    {
        if (this._startDate != null) this._elapsed += new Date() - this._startDate;
        this._startDate = null;
    },

    Reset: function()
    {
        Linq.Tools.Stopwatch.apply(this);
    },

    IsRunning: function()
    {
        return (this._startDate != null);
    },

    Elapsed: function()
    {
        if (this.IsRunning())
        {
            return this._elapsed + (new Date() - this._startDate);
        }
        else
        {
            return this._elapsed;
        }
    }
}

/* HashSet */

Linq.Tools.HashSet = function()
{
    this.PrimitiveContainer = {};
    this.ObjectContainer = [];
}

// Overload:function()
// Overload:function(params keys)
// Overload:function(array key)
Linq.Tools.HashSet.Create = function()
{
    var hashSet = new Linq.Tools.HashSet();
    var seq = (arguments.length === 1 && arguments[0] instanceof Array)
                ? E.From(arguments).SelectMany("$")
                : E.From(arguments);
    seq.ForEach(function(x) { hashSet.Add(x) });
    return hashSet;
}

Linq.Tools.HashSet.prototype =
{
    _IsPrimitive: function(value)
    {
        switch (typeof value)
        {
            case "string":
            case "boolean":
            case "number":
            case "undefined":
                return true;
            case "object":
            case "function":
                return (value == null);
        }
    },

    Add: function(key)
    {
        if (this._IsPrimitive(key))
        {
            this.PrimitiveContainer[key] = null;
        }
        else
        {
            if (!E.From(this.ObjectContainer).Contains(key))
            {
                this.ObjectContainer.push(key);
            }
        }
    },

    AsLinqable: function()
    {
        return E.From(this.PrimitiveContainer).Select("$.Key")
            .Concat(E.From(this.ObjectContainer));
    },

    Clear: function()
    {
        this.PrimitiveContainer = {};
        this.ObjectContainer = [];
    },

    Contains: function(key)
    {
        if (this._IsPrimitive(key))
        {
            return this.PrimitiveContainer.hasOwnProperty(key);
        }
        else
        {
            return E.From(this.ObjectContainer).Contains(key);
        }
    },

    Count: function()
    {
        return E.From(this.PrimitiveContainer).Count() + this.ObjectContainer.length;
    },

    Remove: function(key)
    {
        if (this._IsPrimitive(key))
        {
            delete this.PrimitiveContainer[key];
        }
        else
        {
            var index = E.From(this.ObjectContainer).IndexOf(key);
            if (index > -1) this.ObjectContainer.splice(index, 1);
        }
    }
}

/* HttpUtility */

Linq.Tools.HttpUtility = {};

Linq.Tools.HttpUtility.HtmlEncode = function(input)
{
    var encodeChars = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
    return input.replace(/[&<>]/g, function(m) { return encodeChars[m] });
}

Linq.Tools.HttpUtility.HtmlDecode = function(input)
{
    var decodeChars = { "amp": "&", "lt": "<", "gt": ">" };
    return input.replace(/&(amp|lt|gt);/g, function(m, c) { return decodeChars[c] });
}

Linq.Tools.HttpUtility.ParseQueryString = function(query)
{
    return E.From(query.split('?'))
        .SelectMany("$.split('&')", "a,b=>b.split('=')")
        .Where("$.length == 2")
        .ToObject("decodeURIComponent($[0])", "decodeURIComponent($[1])");
}

Linq.Tools.HttpUtility.ToQueryString = function(obj)
{
    return E.From(obj)
        .Select(function(kvp)
        {
            return Linq.Tools.Template("{0}={1}",
                encodeURIComponent(kvp.Key), encodeURIComponent(kvp.Value));
        })
        .ToString("&");
}

/* DateTimeUtility */

Linq.Tools.DateUtility = {};

Linq.Tools.DateUtility.DaysInMonth = function(year, month)
{
    return new Date(year, month, 0).getDate();
}

Linq.Tools.DateUtility.IsLeapYear = function(year)
{
    return ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0));
}

Linq.Tools.DateUtility.Format = function(date, format)
{
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    var hour = date.getHours().toString();
    var minute = date.getMinutes().toString();
    var second = date.getSeconds().toString();
    var dayOfWeek = date.getDay();

    var DayOfWeekEN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var DayOfWeekJA = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

    var PadZero = function(str, width)
    {
        var count = width - str.length;
        return E.Repeat("0", count).ToString() + str;
    };

    var formatDict =
    {
        DDDD: DayOfWeekEN[dayOfWeek],
        DDD: DayOfWeekEN[dayOfWeek].substr(0, 3),
        dddd: DayOfWeekJA[dayOfWeek],
        ddd: DayOfWeekJA[dayOfWeek].substr(0, 1),
        yyyy: year,
        yy: year.substring(2),
        y: year.substring(3),
        MM: PadZero(month, 2),
        M: month,
        dd: PadZero(day, 2),
        d: day,
        HH: PadZero(hour, 2),
        H: hour,
        hh: (hour > 12) ? "pm" + PadZero((hour - 12).toString(), 2) : "am" + PadZero(hour, 2),
        h: (hour > 12) ? "pm" + (hour - 12) : "am" + hour,
        mm: PadZero(minute, 2),
        m: minute,
        ss: PadZero(second, 2),
        s: second
    };

    var regex = /DDDD|DDD|dddd|ddd|yyyy|yy|y|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s/g;
    return format.replace(regex, function(m) { return formatDict[m] });
}

Linq.Tools.DateUtility.Parse = function(strDate, format)
{
    var date =
    {
        year: 1,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0
    };

    var regex = /yyyy|MM|dd|HH|mm|ss/g;
    var match;
    while (match = regex.exec(format))
    {
        var value = strDate.substr(match.index, match[0].length);
        switch (match[0])
        {
            case "yyyy":
                date.year = value;
                break;
            case "MM":
                date.month = value;
                break;
            case "dd":
                date.day = value;
                break;
            case "HH":
                date.hour = value;
                break;
            case "mm":
                date.minute = value;
                break;
            case "ss":
                date.second = value;
                break;
        }
    }

    return new Date(date.year, date.month - 1, date.day, date.hour, date.minute, date.second);
}