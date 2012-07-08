﻿// QUnit Extensions
// Method Chaning base assertion.

(function (root) {
    if (root.Enumerable == null) {
        throw new Error("can't find Enumerable. linq.qunit.js must load after linq.js");
    }

    var Enumerable = root.Enumerable;
    Enumerable.Assert = {};

    // overwrite array
    Enumerable.Utils.extendTo(Array);

    // defProp helper, support only modern browser
    var defineToObject = function (methodName, value) {
        Object.defineProperty(Object.prototype, methodName, {
            enumerable: false,
            configurable: true,
            writable: true,
            value: value
        });
    };

    var isCollection = function (obj) {
        if (obj instanceof Enumerable) return true;
        if (obj instanceof Array) return true;

        return false;
    };

    var unbox = function (obj) {
        if (obj instanceof Number) return obj + 0;
        if (obj instanceof String) return obj + "";
        if (obj instanceof Boolean) return !!obj;
        return obj;
    };

    var executeCode = function (action) {
        try {
            action();
            return null;
        }
        catch (e) {
            return e;
        }
    };

    defineToObject("is", function (expected, message) {
        /// <signature>
        ///   <summary>strictEqual. if "this" is Array or Enumerable then deepEqual with expected and both normalized to array.</summary>
        ///   <param name="expected" type="Object">expected value</param>
        ///   <param name="message" type="String">[Optional] assertion message</param>
        /// </signature>
        /// <signature>
        ///   <summary>collection deepEqual. argument is multiple.</summary>
        ///   <param name="multipleExpected" type="Object">mulitple arguments. ex:[1,2,3].is(1,2,3).</param>
        /// </signature>
        /// <signature>
        ///   <summary>ok(true). expected function pass actual. if result is true then ok.</summary>
        ///   <param name="expected" type="Function">function checker, return boolean</param>
        ///   <param name="message" type="String">[Optional] assertion message</param>
        /// </signature>
        if (isCollection(this)) {
            if (arguments.length <= 2 && isCollection(expected)) {
                deepEqual(Enumerable.from(this).toArray(), Enumerable.from(expected).toArray(), message);
            }
            else {
                deepEqual(Enumerable.from(this).toArray(), Enumerable.from(arguments).toArray());
            }
        }
        else {
            if (expected instanceof Function) {
                ok(expected(unbox(this)), message);
            }
            else {
                strictEqual(unbox(this), expected, message);
            }
        }
    });

    defineToObject("isNot", function (expected, message) {
        /// <signature>
        ///   <summary>notStrictEqual. if "this" is Array or Enumerable then notDeepEqual with expected and both normalized to array.</summary>
        ///   <param name="expected" type="Object">expected value.</param>
        ///   <param name="message" type="String">Optional:assertion message.</param>
        /// </signature>
        /// <signature>
        ///   <summary>collection notDeepEqual. argument is multiple.</summary>
        ///   <param name="multipleExpected" type="Object">mulitple arguments. ex:[1,2,3].isNot(-1,2,3).</param>
        /// </signature>
        /// <signature>
        ///   <summary>ok(false). expected function pass actual. if result is false then ok.</summary>
        ///   <param name="expected" type="Function">function checker, return boolean</param>
        ///   <param name="message" type="String">[Optional] assertion message</param>
        /// </signature>
        if (isCollection(this)) {
            if (arguments.length <= 2 && isCollection(expected)) {
                notDeepEqual(Enumerable.from(this).toArray(), Enumerable.from(expected).toArray(), message);
            }
            else {
                notDeepEqual(Enumerable.from(this).toArray(), Enumerable.from(arguments).toArray());
            }
        }
        else {
            if (expected instanceof Function) {
                ok(!expected(unbox(this)), message);
            }
            else {
                notStrictEqual(unbox(this), expected, message);
            }
        }
    });

    Enumerable.Assert.expectError = function (testAction, message) {
        /// <summary>Throw error in testCode.</summary>
        /// <param name="testCode" type="Function">action function.</param>
        /// <param name="message" type="String">[Optional] assertion message.</param>
        var error = executeCode(testAction);

        if (error != null) {
            ok(true, message);
        }
        else {
            ok(false, "Failed testCode does not throw error." + ((message != null) ? " Message:" + message : ""));
        }

        return error;
    };

    defineToObject("doesNotThrow", function (testAction, message) {
        /// <summary>Does not throw error in testCode.</summary>
        /// <param name="testCode" type="Function">action function.</param>
        /// <param name="message" type="String">[Optional] assertion message.</param>
        var error = executeCode(testAction);

        if (error != null) {
            ok(false, "Failed testCode throws error. CatchedErrorMessage:" + error.message + ((message != null) ? " Message:" + message : ""));
        }
    });
})(this);