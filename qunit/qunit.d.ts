declare module QUnit {

	/**
	 * Callbacks to run before and after each test.
	 */
	interface ITestLifeCycle {
		/**
		 * Runs before each test.
		 */		
		setup: ()=>void;
		/**
		 * Runs before each test.
		 */		
		teardown:()=>void;
	}
	
	/**
	 * Group related tests under a single label.
	 * @param name The module name
	 * @param lifecycle Callbacks to run before and after each test
	 */
	export function module(name: string, lifecycle?:ITestLifeCycle);
	/**
	 * Add a test to run.
	 * @param name Name of unit test
	 * @param test Function to close over assertions
	 */
	export function test(name: string, test:()=>void);
	/**
	 * Add an asynchronous test to run. The test must include a call to start().
	 * @param name Name of unit test
	 * @param expected Number of assertions in this test
	 * @param test Function to close over assertions
	 */
	export function asyncTest(name: string, expected: number, test:()=>void);
	/**
	 * Specify how many assertions are expected to run within a test.
	 * @param amount Number of assertions in this test.
	 */
	export function expect(amount: number);
	/**
	 * A boolean assertion, equivalent to CommonJS’s assert.ok() and JUnit’s assertTrue(). Passes if the first argument is truthy.
	 * @param isOK Passes if true
	 * @param message A short description of the assertion
	 */
	export function ok(isOK: boolean, message?: string);
	/**
	 * A non-strict comparison assertion
	 * @param actual Expression being tested
	 * @param expected Known comparison value
	 * @param message A short description of the assertion
	 */
	export function equal(actual: any, expected: any, message?: string);
	/**
	 * A non-strict comparison assertion, checking for inequality.
	 * @param actual Expression being tested
	 * @param expected Known comparison value
	 * @param message A short description of the assertion
	 */
	export function notEqual(actual: any, expected: any, message?: string);
	/**
	 * A deep recursive comparison assertion, working on primitive types, 
	 * arrays, objects, regular expressions, dates and functions.
	 * @param actual Expression being tested
	 * @param expected Known comparison value
	 * @param message A short description of the assertion
	 */
	export function deepEqual(actual: any, expected: any, message?: string);
	/**
	 * An inverted deep recursive comparison assertion, 
	 * working on primitive types, arrays, objects, regular expressions, dates and functions
	 * @param actual Expression being tested
	 * @param expected Known comparison value
	 * @param message A short description of the assertion
	 */
	export function notDeepEqual(actual: any, expected: any, message?: string);
	/**
	 * A strict type and value comparison assertion.
	 * @param actual Expression being tested
	 * @param expected Known comparison value
	 * @param message A short description of the assertion
	 */
	export function strictEqual(actual: any, expected: any, message?: string);
	/**
	 * A non-strict comparison assertion, checking for inequality.
	 * @param actual Expression being tested
	 * @param expected Known comparison value
	 * @param message A short description of the assertion
	 */
	export function notStrictEqual(actual: any, expected: any, message?: string);
	/**
	 * Assertion to test if a callback throws an exception when run
	 * @param block Function to execute
	 * @param expected Expected error
	 * @param message A short description of the assertion
	 */
	export function raises(block:()=>void, expected: any, message?:string);
	/**
	 * Start running tests again after the testrunner was stopped. See stop()
	 */
	export function start();
	/**
	 * Stop the testrunner to wait for async tests to run. Call start() to continue.
	 */
	export function stop();
}