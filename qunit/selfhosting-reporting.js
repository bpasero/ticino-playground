/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
 /*global define,QUnit*/
define('qunit/selfhosting-reporting', function() {
    'use strict';

	if(!window.callPhantom) {
		return;
	}
	
	var failedAssertions = [];
	var totalTestsCount = 0;
	var failedTestsCount = 0;
	var passedTestsCount = 0;
	
	var allTests = [];
	var currentModuleName = "";
	
	function capString(string) {
		if(string) {
			if(!string.substr) {
				string = JSON.stringify(string);
			}
			return string.substr(0, 255);
		}
		return string;
	}
	
	// QUnit.log({ result, actual, expected, message }) is called whenever an
	// assertion is completed. result is a boolean (true for passing, false 
	// for failing) and message is a string description provided by the assertion.
	QUnit.log = function (details) {
		if (details.result === false) {
			details.message = capString(details.message);
			details.actual = capString(details.actual);
			details.expected = capString(details.expected);
			failedAssertions.push(details);
		}
	};
	
	// QUnit.testStart({ name }) is called whenever a new test batch of
	// assertions starts running. name is the string name of the test batch.
	QUnit.testStart = function (details) {
		totalTestsCount++;
	};
	
	// QUnit.testDone({ name, failed, passed, total }) is called whenever
	// a batch of assertions finishes running. name is the string name of
	// the test batch. failed is the number of test failures that occurred.
	// total is the total number of test assertions that occurred.
	// Passed is the number of test assertions that passed.
	QUnit.testDone = function (details) {
		if (details.failed) {
			failedTestsCount ++;
		} else {
			passedTestsCount ++;
		}
		allTests.push({
			moduleName: currentModuleName,
			name: details.name,
			passed: details.passed,
			total: details.total,
			failed: details.failed,
			failedAssertions: failedAssertions, 
			timeTaken: details.timeTaken, 
			testId: details.testId
		});
		failedAssertions = [];
	};
	
	// QUnit.moduleStart({ name }) is called whenever a new module of
	// tests starts running. name is the string name of the module.
	QUnit.moduleStart = function (details) {
		currentModuleName = details.name;
	};
	
	// QUnit.done({ failed, passed, total, runtime }) is called whenever
	// all the tests have finished running. failed is the number of failures
	// that occurred. total is the total number of assertions that occurred,
	// passed the passing assertions. runtime is the time in milliseconds
	// to run the tests from start to finish.
	var originalDone = QUnit.done;
	QUnit.done = function (data) {
		var i, len, currentTimestamp = (new Date().getTime());
		var result = {
			failedTestsCount: failedTestsCount,
			passedTestsCount: passedTestsCount,
			totalTestsCount: totalTestsCount,
			
			failedAssertionsCount:data.failed,
			passedAssertionsCount:data.passed,
			totalAssertionsCount:data.total,
			
			runtime:data.runtime,
			
			timestamp: currentTimestamp
		};
		
		result.failedTests = [];
		for (i = 0, len = allTests.length; i < len; i++) {
			if (allTests[i].failed > 0) {
				result.failedTests.push(allTests[i]);
			}
			if(result.failedTests.length > 200) {
				break;
			}
		}
		
		if (QUnit.urlParams){
			// results for performance runs reports different attributes
			if (QUnit.urlParams.filter==="-perf_test") {
				result = {
					failedTestsCount: failedTestsCount,
					passedTestsCount: passedTestsCount,
					totalTestsCount: totalTestsCount,
					allTests : allTests 
				};
			}
		}
		window.callPhantom(result);
		
		originalDone(data);
	};	
});