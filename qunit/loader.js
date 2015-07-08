/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*global importScripts*/
// ---- compatibility ------------------------------------------------------------
(function (global) {
	'use strict';
	
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
	if (typeof Object.defineProperty !== 'function') {
		Object.defineProperty = function (target, property, attributes) {
			target[property] = attributes.value;
		};
	}
	if (typeof Object.defineProperties !== 'function') {
		Object.defineProperties = function (target, properties) {
			for (var prop in properties) {
				if (properties.hasOwnProperty(prop)) {
					target[prop] = properties[prop].value;
				}
			}
		};
	}
	if (typeof Object.keys !== 'function') {
		(function () {
			var localHasOwnProperty = Object.prototype.hasOwnProperty;
			Object.keys = function (o) {
				var result = [];
				for (var i in o) {
					if (localHasOwnProperty.call(o, i)) {
						result.push(i.toString());
					}
				}
				return result;
			};
		})();
	}
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function (callbackfn, thisArg) {
			for (var i = 0, len = this.length; i < len; i++) {
				callbackfn.call(thisArg, this[i], i, this);
			}
		};
	}
	if (!Array.prototype.some) {
		Array.prototype.some = function (callbackfn, thisArg) {
			for (var i = 0, len = this.length; i < len; i++) {
				if (callbackfn.call(thisArg, this[i], i, this)) {
					return true;
				}
			}
			return false;
		};
	}
	if (!Array.isArray) {
		Array.isArray = function (something) {
			return something ? something.constructor === Array : false;
		};
	}
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			
			var i, len, ch;
			
			var from = -1;
			for (i = 0, len = this.length; i < len; i++) {
				ch = this.charAt(i);
				if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') {
					from = i;
					break;
				}
			}
			
			if (from === -1) {
				return '';
			}
			
			var to;
			for (i = len - 1; i >= 0; i--) {
				ch = this.charAt(i);
				if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') {
					to = i + 1;
					break;
				}
			}
			
			return this.substring(from, to);
		};
	}
	if (!Array.prototype.map) {
		Array.prototype.map = function (callbackfn, thisArg) {
			var r = [];
			for (var i = 0, len = this.length; i < len; i++) {
				r[i] = callbackfn.call(thisArg, this[i], i, this);
			}
			return r;
		};
	}
	if (!Array.prototype.filter) {
		Array.prototype.filter = function (callbackfn, thisArg) {
			var r = [], v;
			for (var i = 0, len = this.length; i < len; i++) {
				v = this[i];
				if (callbackfn.call(thisArg, this[i], i, this)) {
					r.push(v);
				}
			}
			return r;
		};
	}
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (element, fromIndex) {
			fromIndex = fromIndex || 0;
			if (fromIndex >= this.length) {
				return -1;
			}
			for (var i = fromIndex, len = this.length; i < len; i++) {
				if (this[i] === element) {
					return i;
				}
			}
			return -1;
		};
	}
	if (!Function.prototype.bind) {
		Function.prototype.bind = (function () {
			var slice = Array.prototype.slice;
			return function () {
				var originalFunc = this, thisArg = arguments[0], boundArgs = slice.call(arguments, 1);
				return function () {
					return originalFunc.apply(thisArg, slice.call(boundArgs, 0).concat(slice.call(arguments, 0)));
				};
			};
		})();
	}
})(this);
// ---- end compatibility ------------------------------------------------------------

(function(global) {
	'use strict';
	
	if (typeof global.define === 'function' && global.define.amd) {
		//console.warn('Detected another loader, bailing out');
		return;
	}
	
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// utils

	var anonymousModuleGenerator = (function() {
		var id = 1;
		return function () {
			return '===anonymous' + (id++) + '===';
		};
	})();
	
	var isWebWorker = (typeof global.importScripts === 'function');
	
	if (!global.console) {
		global.console = {};
	}
	if (!global.console.log) {
		global.console.log = function () {};
	}
	
	// Capture console.log
	var consoleLog = Function.prototype.bind.call(global.console.log, global.console);
	
	// Function to invoke console.log
	var consoleLogInvoker = function () {
		consoleLog.apply(global.console, arguments);
	};
	
	if (!global.console.debug) {
		global.console.debug = consoleLogInvoker;
	}
	if (!global.console.info) {
		global.console.info = consoleLogInvoker;
	}
	if (!global.console.warn) {
		global.console.warn = consoleLogInvoker;
	}
	if (!global.console.error) {
		global.console.error = consoleLogInvoker;
	}
	
	function startsWith(haystack, needle) {
		return haystack.length >= needle.length && haystack.substr(0, needle.length) === needle;
	}
	
	function endsWith(haystack, needle) {
		return haystack.length >= needle.length && haystack.substr(haystack.length - needle.length) === needle;
	}
	
	
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// Configuration
	
	function Configuration(options) {
		this.options = options || {};
		
		// baseUrl
		if (!this.options.baseUrl) {
			this.options.baseUrl = '';
		}
		if (this.options.baseUrl.length > 0) {
			if (!endsWith(this.options.baseUrl, '/')) {
				this.options.baseUrl += '/';
			}
		}
		
		// paths
		if (!this.options.paths) {
			this.options.paths = {};
		}
		
		// shim
		if (!this.options.shim) {
			this.options.shim = {};
		}
		
		// ignoreDuplicateModules
		if (!this.options.ignoreDuplicateModules) {
			this.options.ignoreDuplicateModules = [];
		}
		this.ignoreDuplicateModulesMap = {};
		for (var i = 0; i < this.options.ignoreDuplicateModules.length; i++) {
			this.ignoreDuplicateModulesMap[this.options.ignoreDuplicateModules[i]] = true;
		}
	}
	
	Configuration.prototype.getOptionsLiteral = function () {
		return this.options;
	};
	
	Configuration.prototype._applyPaths = function (module) {
		for (var path in this.options.paths) {
			if (this.options.paths.hasOwnProperty(path)) {
				if (startsWith(module, path)) {
					return this.options.paths[path] + module.substr(path.length);
				}
			}
		}
		return module;
	};
	
	Configuration.prototype.moduleIdToPath = function (module) {
		if (endsWith(module, '.js')) {
			return module;
		}
		
		module = this._applyPaths(module) + '.js';
		
		if(startsWith(module, 'http://') || startsWith(module, 'https://')) {
			return module;
		}
		
		return this.options.baseUrl + module;
	};
	
	Configuration.prototype.requireToUrl = function (url) {
		return this.options.baseUrl + this._applyPaths(url);
	};
	
	Configuration.prototype.isShimmed = function (moduleId) {
		return this.options.shim.hasOwnProperty(moduleId);
	};
	
	function recursiveClone(obj) {
		if (!obj || typeof obj !== 'object') {
			return obj;
		}
		var result = (obj instanceof Array) ? [] : {};
		var key, value;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				value = obj[key];
				if (value && typeof value === 'object') {
					result[key] = recursiveClone(value);
				} else {
					result[key] = value;
				}
			}
		}
		return result;
	}
	
	function simpleMixin(destination, source) {
		if (!source || typeof source !== 'object') {
			return destination;
		}
		for (var key in source) {
			if (source.hasOwnProperty(key)) {
				destination[key] = source[key];
			}
		}
		return destination;
	}
	
	Configuration.prototype.cloneAndMerge = function (options) {
		options = options || {};
		
		var resultOptions = recursiveClone(this.options);
		
		
		// baseUrl
		if (options.baseUrl === '' || options.baseUrl) {
			resultOptions.baseUrl = options.baseUrl;
		}
		
		// paths
		simpleMixin(resultOptions.paths, options.paths);
		
		// shim
		simpleMixin(resultOptions.shim, options.shim);
		
		// ignoreDuplicateModules
		if (options.ignoreDuplicateModules) {
			resultOptions.ignoreDuplicateModules.push.apply(resultOptions.ignoreDuplicateModules, options.ignoreDuplicateModules);
		}
		
		return new Configuration(resultOptions);
	};
	
	Configuration.prototype.getShimmedModuleDefine = function (moduleId) {
		var shimMD = this.options.shim[moduleId];
		if (!shimMD) {
			return null;
		}
		var result = {};
		if (shimMD instanceof Array) {
			result.dependencies = shimMD;
		} else {
			result.dependencies = shimMD.deps || [];
			if (shimMD.exports) {
				// TODO: Normalize testing of types into an util
				if (shimMD.exports instanceof Function) {
					result.callback = shimMD.exports;
				} else if (shimMD.exports instanceof String) {
					result.callback = function() {
						return global[shimMD.exports];
					};
				} else {
					result.callback = {};
				}	
			} else {
				result.callback = {};
			}
		}
		return result;
	};
	
	Configuration.prototype.isDuplicateMessageIgnoredFor = function(id) {
		return this.ignoreDuplicateModulesMap.hasOwnProperty(id);
	};
	
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ModuleIdResolver
	
	function ModuleIdResolver(config, fromModuleId) {
		this._config = config;
		this.fromModuleId = fromModuleId;
		this.fromModulePath = this._pathOf(this.fromModuleId);
	}
	
	ModuleIdResolver.prototype._pathOf = function (moduleId) {
		var lastSlash = moduleId.lastIndexOf('/');
		if (lastSlash !== -1) {
			return moduleId.substr(0, lastSlash + 1);
		} else {
			return '';
		}
	};
	
	ModuleIdResolver.prototype._normalizeModuleId = function (moduleId) {
		/// <summary>
		///    Normalize 'a/../name' to 'name'
		/// </summary>
		
		// '/../xxxx' => '/xxxx' (can't go above root)
		while(startsWith(moduleId, '/../')) {
			moduleId = moduleId.substr(3);
		}
		
		var startsWithSlash = moduleId.length > 0 && moduleId.charAt(0) === '/';
		var parts = moduleId.split('/');
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] === '.' || parts[i] === '') {
				parts.splice(i, 1);
				i--;
			} else {
				if (i > 0 && parts[i] === '..' && parts[i-1] !== '..') {
					parts.splice(i - 1, 2);
					i -= 2;
				}
			}
		}
		
		return (startsWithSlash ? '/' : '') + parts.join('/');
	};
	
	ModuleIdResolver.prototype.resolveModule = function (moduleId) {
		var result = null;
		
		if (startsWith(moduleId, './') || startsWith(moduleId, '../')) {
			result = this.fromModulePath + moduleId;
		} else {
			result = moduleId;
		}
		
		return this._normalizeModuleId(result);
	};
	
	ModuleIdResolver.prototype.moduleIdToPath = function (moduleId) {
		return this._config.moduleIdToPath(moduleId);
	};
	
	ModuleIdResolver.prototype.requireToUrl = function (moduleId) {
		return this._config.requireToUrl(moduleId);
	};
	

	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// Module
	
	function Module(id, dependencies, callback, moduleIdResolver) {
		this._id = id;
		this._dependencies = dependencies;
		this._dependenciesValues = [];
		this._callback = callback;
		this._moduleIdResolver = moduleIdResolver;
		this._exports = {};
		this._exportsPassedIn = false;
		
		this._digestDependencies();
		
		if (this._unresolvedDependenciesCount === 0) {
			this._complete();
		}
	}
	
	Module.prototype._digestDependencies = function () {
		// Exact count of dependencies
		this._unresolvedDependenciesCount = this._dependencies.length;
		
		// Send on to the manager only a subset of dependencies
		// For example, 'exports' and 'module' can be fulfilled locally
		this._managerDependencies = [];
		this._managerDependenciesMap = {};
		
		var i, len, d;
		for (i = 0, len = this._dependencies.length; i < len; i ++) {
			d = this._dependencies[i];
			
			if (d === 'exports') {
				// Fulfill 'exports' locally and remember that it was passed in
				// Later on, ee will ignore the return value of the factory
				this._exportsPassedIn = true;
				this._dependenciesValues[i] = this._exports;
				this._unresolvedDependenciesCount--;
			} else if (d === 'module') {
				// Fulfill 'module' locally
				this._dependenciesValues[i] = {
					id: this._id
				};
				this._unresolvedDependenciesCount--;
			} else if (d === 'require') {
				// Request 'requre' from the manager
				this._managerDependencies.push(d);
				this._managerDependenciesMap[d] = i;
			} else {
				// Normalize dependency and then request it from the manager
				var bangIndex = d.indexOf('!');
				if (bangIndex >= 0) {
					var pluginId = d.substring(0, bangIndex);
					var pluginParam = d.substring(bangIndex + 1, d.length);
					d = this._moduleIdResolver.resolveModule(pluginId) + '!' + pluginParam;
				} else {
					d = this._moduleIdResolver.resolveModule(d);
				}
				this._managerDependencies.push(d);
				this._managerDependenciesMap[d] = i;
			}
		}
	};
	
	Module.prototype.renameDependency = function (oldDependencyId, newDependencyId) {
		/// <summary>
		///   Called by the module manager because plugin dependencies can not
		///   be normalized statically, the part after '!' can only be normalized
		///   once the plugin has loaded and its normalize logic is plugged in.
		/// </summary>
		if (!this._managerDependenciesMap.hasOwnProperty(oldDependencyId)) {
			throw new Error('Loader: Cannot rename an unknown dependency!');
		}
		var index = this._managerDependenciesMap[oldDependencyId];
		delete this._managerDependenciesMap[oldDependencyId];
		this._managerDependenciesMap[newDependencyId] = index;
	};
	
	Module.prototype.getId = function () {
		return this._id;
	};
	
	Module.prototype.getModuleIdResolver = function () {
		return this._moduleIdResolver;
	};
	
	Module.prototype.isExportsPassedIn = function () {
		return this._exportsPassedIn;
	};
	
	Module.prototype.getExports = function () {
		return this._exports;
	};
	
	Module.prototype.getDependencies = function () {
		return this._managerDependencies;
	};
	
	Module.prototype._complete = function () {
		var error = null;
		if (this._callback) {
			if (typeof this._callback === 'function') {
				try {
					var returnedExports = this._callback.apply(global, this._dependenciesValues);
					if (!this._exportsPassedIn) {
						this._exports = returnedExports;
					}
				} catch (e) {
					error = e;
				}
			} else {
				this._exports = this._callback;
			}
		}
		
		if (error) {
			console.error(error.stack);
			console.error(error);
		}
	};
	
	Module.prototype.resolveDependency = function (id, value) {
		if (this._managerDependenciesMap.hasOwnProperty(id)) {
			this._dependenciesValues[this._managerDependenciesMap[id]] = value;
			this._unresolvedDependenciesCount--;
			if (this._unresolvedDependenciesCount === 0) {
				this._complete();
			}
		} else {
			throw new Error('Cannot resolve a dependency I do not have!');
		}
	};

	Module.prototype.isComplete = function () {
		return this._unresolvedDependenciesCount === 0;
	};
	
	
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ModuleManager
	
	function ModuleManager(scriptLoader) {
		this._defaultConfig = new Configuration();
		this._scriptLoader = scriptLoader;
		
		// Hash map of module id => module.
		// If a module is found in _modules, its code has been loaded, but
		// not necessary all its dependencies have been resolved
		this._modules = {};
		
		// Set of module ids => true
		// If a module is found in _knownModules, a call has been made
		// to the scriptLoader to load its code or a call will be made
		// This is mainly used as a flag to not try loading the same module twice
		this._knownModules = {};
		
		// Hash map of module id => array [module id]
		this._inverseDependencies = {};
		
		// Hash map of module id => array [module id]
		this._dependencies = {};
		
		// Hash map of module id => array [ { moduleId, pluginParam } ]
		this._inversePluginDependencies = {};
		
		// Count the number of define calls received
		this._queuedDefineCalls = [];
		
		// Count the number of scripts currently loading
		this._loadingScriptsCount = 0;
	}
	
	ModuleManager.prototype.enqueueDefineModule = function (id, dependencies, callback) {
		if (this._loadingScriptsCount === 0) {
			// There are no scripts currently loading, so no load event will be fired, so the queue will not be consumed
			this.defineModule(id, dependencies, callback);
		} else {
			this._queuedDefineCalls.push({
				id: id,
				dependencies: dependencies,
				callback: callback
			});
		}
	};
	
	ModuleManager.prototype.enqueueDefineAnonymousModule = function (dependencies, callback) {
		/// <summary>
		///   Defines an anonymous module (without an id).
		///   Its name will be resolved as we receive a callback from the scriptLoader
		/// </summary>
		/// <param name='dependencies' type='Array'>
		///   See defineModule
		/// </param>
		/// <param name='callback' type='Any'>
		///   See defineModule
		/// </param>
		this._queuedDefineCalls.push({
			id: null,
			dependencies: dependencies,
			callback: callback
		});
	};
	
	ModuleManager.prototype.defineModule = function (id, dependencies, callback, moduleIdResolver) {
		/// <summary>
		///   Creates a module and stores it in _modules.
		///   The manager will immediately begin resolving its dependencies.
		/// </summary>
		/// <param name="id" type="string">
		///   An unique and absolute id of the module. This must not collide
		///   with another module's id
		/// </param>
		/// <param name="dependencies" type="Array">
		///   An array with the dependencies of the module. Special keys are:
		///   "require", "exports" and "module"
		/// </param>
		/// <param name="callback" type="Any">
		///   if callback is a function, it will be called with the resolved dependencies.
		///   if callback is an object, it will be considered as the exports of the module. 
		/// </param>
		
		if (this._modules.hasOwnProperty(id)) {
			if (!this._defaultConfig.isDuplicateMessageIgnoredFor(id)) {
				console.warn('Duplicate definition of module \'' + id + '\'');
			}
			// super important! Ignore duplicate module definition
			return;
		}
		
		var module = new Module(id, dependencies, callback, (moduleIdResolver || new ModuleIdResolver(this._defaultConfig, id)));
		this._modules[id] = module;
		
		// TODO: If we must support unordered multiple define calls inside a file, then execute this in a timeout
		this._resolve(module);
	};
	
	ModuleManager.prototype._relativeRequire = function (moduleIdResolver, dependencies, callback) {
		if (typeof dependencies === 'string') {
			return this.synchronousRequire(dependencies, moduleIdResolver);
		}
		
		this.defineModule(anonymousModuleGenerator(), dependencies, callback, moduleIdResolver);
	};
	
	ModuleManager.prototype.synchronousRequire = function (id, moduleIdResolver) {
		/// <summary>
		///   Require synchronously a module by its absolute id.
		///   If the module is not loaded, an exception will be thrown.
		/// </summary>
		/// <param name="id" type="string">
		///   The unique and absolute id of the required module
		/// </param>
		/// <returns type="Any">
		///   The exports of module 'id'
		/// </returns>
		
		moduleIdResolver = (moduleIdResolver || new ModuleIdResolver(this._defaultConfig, id)); 
		var moduleId = moduleIdResolver.resolveModule(id);
		
		if (!this._modules.hasOwnProperty(moduleId)) {
			throw new Error('Check dependency list! Synchronous require cannot resolve module \'' + moduleId + '\'. This is the first mention of this module!');
		}
		var module = this._modules[moduleId];
		if (!module.isComplete()) {
			throw new Error('Check dependency list! Synchronous require cannot resolve module \'' + moduleId + '\'. This module has not been resolved completely yet.');
		}
		return module.getExports();
	};
	
	ModuleManager.prototype.setConfig = function (config) {
		this._defaultConfig = config;
	};
	
	ModuleManager.prototype.getConfig = function () {
		return this._defaultConfig;
	};
	
	ModuleManager.prototype._onLoad = function (id) {
		/// <summary>
		///   Callback from the scriptLoader when a module has been loaded.
		///   This means its code is available and has been executed.
		/// </summary>
		
		var defineCall;
		
		this._loadingScriptsCount --;
		
		if (this._defaultConfig.isShimmed(id)) {
			// Consume only named modules in the queue 
			while (this._queuedDefineCalls.length > 0) {
				if (this._queuedDefineCalls[0].id) {
					defineCall = this._queuedDefineCalls.shift();
					this.defineModule(defineCall.id, defineCall.dependencies, defineCall.callback);
				} else {
					break;
				}
			}
			
			// If a shimmed module has loaded, create a define call for it
			defineCall = this._defaultConfig.getShimmedModuleDefine(id);
			this.defineModule(id, defineCall.dependencies, defineCall.callback);
		} else {
			if (this._queuedDefineCalls.length === 0) {
				console.warn('No define call received from module ' + id + '. This might be a problem.');
			} else {
				// Consume queue until first anonymous define call
				// or until current id is found in the queue
				while (this._queuedDefineCalls.length > 0) {
					defineCall = this._queuedDefineCalls.shift();
					if (defineCall.id === id || defineCall.id === null) {
						// Hit an anonymous define call or its own define call
						defineCall.id = id;
						this.defineModule(defineCall.id, defineCall.dependencies, defineCall.callback);
						break;
					} else {
						// Hit other named define calls
						this.defineModule(defineCall.id, defineCall.dependencies, defineCall.callback);
					}
				}
			}			
		}
		
		if (this._loadingScriptsCount === 0) {
			// No more on loads will be triggered, so make sure queue is empty
			while (this._queuedDefineCalls.length > 0) {
				defineCall = this._queuedDefineCalls.shift();
				if (defineCall.id === null) {
					console.error('Found an unmatched anonymous define call in the define queue. Ignoring it!');
				} else {
					// Hit other named define calls
					this.defineModule(defineCall.id, defineCall.dependencies, defineCall.callback);
				}
			}
		}
	};
	
	ModuleManager.prototype._onLoadError = function (id) {
		/// <summary>
		///   Callback from the scriptLoader when a module hasn't been loaded.
		///   This means that the script was not found (e.g. 404) or there was an error in the script.
		/// </summary>
		
		this._loadingScriptsCount --;
		
		console.error('Loading ' + id + ' failed, here are the modules that depend on it: ');
		console.error(this._inverseDependencies[id]);
	};
	
	ModuleManager.prototype._onModuleComplete = function (id, exports) {
		/// <summary>
		///   Module id has been loaded completely, its exports are available.
		/// </summary>
		/// <param name="id" type="string">
		///   Module's id
		/// </param>
		/// <param name="exports" type="Any">
		///   Module's exports
		/// </param>
		var i, len, inverseDependencies, inverseDependencyId, inverseDependency;
		
		if (this._inverseDependencies.hasOwnProperty(id)) {
			// Fetch and clear inverse dependencies
			inverseDependencies = this._inverseDependencies[id];
			delete this._inverseDependencies[id];
			
			// Resolve one inverse dependency at a time, always
			// on the lookout for a completed module.
			for (i = 0, len = inverseDependencies.length; i < len; i++) {
				inverseDependencyId = inverseDependencies[i];
				inverseDependency = this._modules[inverseDependencyId];
				
				inverseDependency.resolveDependency(id, exports);
				if (inverseDependency.isComplete()) {
					this._onModuleComplete(inverseDependencyId, inverseDependency.getExports());
				}
			}
		}
		
		if (this._inversePluginDependencies.hasOwnProperty(id)) {
			// This module is used as a plugin at least once
			// Fetch and clear these inverse plugin dependencies
			
			inverseDependencies = this._inversePluginDependencies[id];
			delete this._inversePluginDependencies[id];
			
			// Resolve plugin dependencies one at a time
			for (i = 0, len = inverseDependencies.length; i < len; i++) {
				this._resolvePluginDependencySync(inverseDependencies[i].moduleId, inverseDependencies[i].dependencyId, exports);
			}
		}
	};
	
	ModuleManager.prototype._hasDependencyPath = function (from, to) {
		/// <summary>
		///   Walks (recursively) the dependencies of 'from' in search of 'to'.
		///   Returns true if there is such a path or false otherwise.
		/// </summary>
		/// <param name="from" type="string">
		///   Module id to start at
		/// </param>
		/// <param name="to" type="string">
		///   Module id to look for
		/// </param> 
		var i, len, inQueue = {}, queue = [], element, dependencies, dependency;
		
		// Insert 'from' in queue
		queue.push(from);
		inQueue[from] = true;
		
		while (queue.length > 0) {
			// Pop first inserted element of queue
			element = queue.shift();
			
			if (this._dependencies.hasOwnProperty(element)) {
				dependencies = this._dependencies[element];
				
				// Walk the element's dependencies
				for (i = 0, len = dependencies.length; i < len; i++) {
					dependency = dependencies[i];
					
					if (dependency === to) {
						// There is a path to 'to'
						return true;
					}
					
					if (!inQueue.hasOwnProperty(dependency)) {
						// Insert 'dependency' in queue
						inQueue[dependency] = true;
						queue.push(dependency);
					}
				}
			}
		}
		
		// There is no path to 'to'
		return false;
	};
	
	ModuleManager.prototype._findCyclePath = function (from, to) {
		/// <summary>
		///   Walks (recursively) the dependencies of 'from' in search of 'to'.
		///   Returns cycle as array.
		/// </summary>
		/// <param name="from" type="string">
		///   Module id to start at
		/// </param>
		/// <param name="to" type="string">
		///   Module id to look for
		/// </param>
		if (from === to) {
			return [from];
		}
		if (!this._dependencies.hasOwnProperty(from)) {
			return null;
		}
		var path, dependencies = this._dependencies[from];
		
		// Walk the element's dependencies
		for (var i = 0, len = dependencies.length; i < len; i++) {
			path = this._findCyclePath(dependencies[i], to);
			if (path !== null) {
				path.push(from);
				return path;
			}
		}
		return null;
	};
	
	ModuleManager.prototype._createRequire = function (moduleIdResolver) {
		/// <summary>
		///   Create the local 'require' that is passed into modules
		/// </summary>
		var result = this._relativeRequire.bind(this, moduleIdResolver);
		result.toUrl = function (id) {
			return moduleIdResolver.requireToUrl(moduleIdResolver.resolveModule(id));
		};
		return result;
	};
	
	ModuleManager.prototype._resolvePluginDependencySync = function (moduleId, dependencyId, plugin) {
		/// <summary>
		///   Resolve a plugin dependency with the plugin loaded & complete
		/// </summary>
		/// <param name="moduleId" type="String">
		///   The module that has this dependency
		/// </param>
		/// <param name="dependencyId" type="String">
		///   The semi-normalized dependency that appears in the module
		///   e.g. 'vs/css!./mycssfile'
		///   Only the plugin part (before !) is normalized
		/// </param>
		/// <param name="plugin" type="Object">
		///   The plugin (what the plugin exports)
		/// </param>
		var module = this._modules[moduleId];
		var moduleIdResolver = module.getModuleIdResolver();
		var bangIndex = dependencyId.indexOf('!');
		var pluginId = dependencyId.substring(0, bangIndex);
		var pluginParam = dependencyId.substring(bangIndex + 1, dependencyId.length);
		
		// Normalize the part which comes after '!'
		var normalize = function (_arg) {
			return moduleIdResolver.resolveModule(_arg);
		}.bind(this);
		
		if (typeof plugin.normalize === 'function') {
			pluginParam = plugin.normalize(pluginParam, normalize);
		} else {
			pluginParam = normalize(pluginParam);
		}
		
		// Now normalize the entire dependency
		var oldDependencyId = dependencyId;
		dependencyId = pluginId + '!' + pluginParam;
		
		// Let the module know that the dependency has been normalized
		// so it can update its internal state
		module.renameDependency(oldDependencyId, dependencyId);
		
		var loadCallback = function (moduleId) {
			// Delegate the loading of the resource to the plugin
			var parentRequire = this._createRequire(moduleIdResolver);
			var load = function (value) {
				this.defineModule(dependencyId, [], value);
			}.bind(this);
			
			load.error = function (error) {
				console.error('Loading ' + dependencyId + ' failed, here are the modules that depend on it: ');
				console.error(this._inverseDependencies[dependencyId]);
			}.bind(this);
			// TODO: pass here configuration to the plugin
			plugin.load(pluginParam, parentRequire, load, this._defaultConfig.getOptionsLiteral());
		}.bind(this);
		
		this._resolveDependency(moduleId, dependencyId, loadCallback);
	};
	
	ModuleManager.prototype._resolvePluginDependencyAsync = function (moduleId, dependencyId) {
		/// <summary>
		///   Resolve a plugin dependency with the plugin not loaded or not complete yet
		/// </summary>
		/// <param name="moduleId" type="String">
		///   The module that has this dependency
		/// </param>
		/// <param name="dependencyId" type="String">
		///   The semi-normalized dependency that appears in the module
		///   e.g. 'vs/css!./mycssfile'
		///   Only the plugin part (before !) is normalized
		/// </param>
		var module = this._modules[moduleId];
		var bangIndex = dependencyId.indexOf('!');
		var pluginId = dependencyId.substring(0, bangIndex);
		
		// Record dependency for when the plugin gets loaded
		this._inversePluginDependencies[pluginId] = this._inversePluginDependencies[pluginId] || [];
		this._inversePluginDependencies[pluginId].push({
			moduleId: moduleId,
			dependencyId: dependencyId
		});
		
		if (!this._modules.hasOwnProperty(pluginId) && !this._knownModules.hasOwnProperty(pluginId)) {
			// This is the first mention of module 'pluginId', so load it
			this._knownModules[pluginId] = true;
			this._loadModule(module.getModuleIdResolver(), pluginId);
		}
	};
	
	ModuleManager.prototype._resolvePluginDependency = function (moduleId, dependencyId) {
		/// <summary>
		///   Resolve a plugin dependency
		/// </summary>
		/// <param name="moduleId" type="String">
		///   The module that has this dependency
		/// </param>
		/// <param name="dependencyId" type="String">
		///   The semi-normalized dependency that appears in the module
		///   e.g. 'vs/css!./mycssfile'
		///   Only the plugin part (before !) is normalized
		/// </param>
		var bangIndex = dependencyId.indexOf('!');
		var pluginId = dependencyId.substring(0, bangIndex);
					
		if (this._modules.hasOwnProperty(pluginId) && this._modules[pluginId].isComplete()) {
			// Plugin has already been loaded & resolved
			this._resolvePluginDependencySync(moduleId, dependencyId, this._modules[pluginId].getExports());
		} else {
			// Plugin is not loaded or not resolved
			this._resolvePluginDependencyAsync(moduleId, dependencyId);
		}
	};
	
	ModuleManager.prototype._injectedShimModuleFactory = function (shimModuleId, loadCallback) {
		/// <summary>
		///   For shim modules which have dependencies, a module is injected
		///   to ensure that the dependencies get loaded before the actual
		///   shim module gets loaded.
		///   This is the factory/callback of such an injected module.
		/// </summary>
		loadCallback(shimModuleId);
	};
	
	ModuleManager.prototype._resolveShimmedDependency = function (moduleId, dependencyId, loadCallback) {
		/// <summary>
		///   Resolve a module dependency to a shimmed module
		///   and delegate the loading to loadCallback.
		/// </summary>
		/// <param name="moduleId" type="String">
		///   The module that has this dependency
		/// </param>
		/// <param name="dependencyId" type="String">
		///   The normalized dependency that appears in the module -- this module is shimmed
		/// </param>
		/// <param name="loadCallback" type="String">
		///   Callback that will be called to trigger the loading of 'dependencyId' if needed
		/// </param>
		
		//   If a shimmed module has dependencies, we must first load those dependencies
		// and only when those are loaded we can load the shimmed module.
		//   To achieve this, we inject a module definition with those dependencies
		// and from its factory method we really load the shimmed module.
		var defineInfo = this._defaultConfig.getShimmedModuleDefine(dependencyId);
		if (defineInfo.dependencies.length > 0) {
			this.defineModule(
					anonymousModuleGenerator(),
					defineInfo.dependencies,
					this._injectedShimModuleFactory.bind(this, dependencyId, loadCallback),
					new ModuleIdResolver(this._defaultConfig, dependencyId)
			);
		} else {
			loadCallback(dependencyId);							
		}
	};
	
	ModuleManager.prototype._resolveDependency = function (moduleId, dependencyId, loadCallback) {
		/// <summary>
		///   Resolve a module dependency and delegate the loading to loadCallback
		/// </summary>
		/// <param name="moduleId" type="String">
		///   The module that has this dependency
		/// </param>
		/// <param name="dependencyId" type="String">
		///   The normalized dependency that appears in the module
		/// </param>
		/// <param name="loadCallback" type="String">
		///   Callback that will be called to trigger the loading of 'dependencyId' if needed
		/// </param>
		var module = this._modules[moduleId];
		
		if (this._modules.hasOwnProperty(dependencyId) && this._modules[dependencyId].isComplete()) {
			// Dependency has already been loaded & resolved
			module.resolveDependency(dependencyId, this._modules[dependencyId].getExports());
		} else {
			// Dependency is not loaded or not resolved
			
			// Record dependency
			this._dependencies[moduleId].push(dependencyId);
			
			if (this._hasDependencyPath(dependencyId, moduleId)) {
				console.warn('There is a dependency cycle between \'' + dependencyId + '\' and \'' + moduleId + '\'. The cyclic path follows:');
				var cyclePath = this._findCyclePath(dependencyId, moduleId);
				cyclePath.reverse();
				cyclePath.push(dependencyId);
				console.warn(cyclePath.join(' => \n'));
				
				var dependency = this._modules.hasOwnProperty(dependencyId) ? this._modules[dependencyId] : null;
				var dependencyValue;
				if (dependency && dependency.isExportsPassedIn()) {
					// If dependency uses 'exports', then resolve it with that object
					dependencyValue = dependency.getExports();
				}
				// Resolve dependency with undefined or with 'exports' object
				module.resolveDependency(dependencyId, dependencyValue);
			} else {
				// Since we are actually waiting for this dependency,
				// record inverse dependency
				this._inverseDependencies[dependencyId] = this._inverseDependencies[dependencyId] || [];
				this._inverseDependencies[dependencyId].push(moduleId);
				
				if (!this._modules.hasOwnProperty(dependencyId) && !this._knownModules.hasOwnProperty(dependencyId)) {
					// This is the first mention of module 'dependencyId', so load it
					// Mark this module as loaded so we don't hit this case again
					this._knownModules[dependencyId] = true;
					if (this._defaultConfig.isShimmed(dependencyId)) {
						this._resolveShimmedDependency(moduleId, dependencyId, loadCallback);
					} else {
						loadCallback(dependencyId);
					}
				}
			}
		}
	};
	
	ModuleManager.prototype._loadModule = function (anyModuleIdResolver, moduleId) {
		this._loadingScriptsCount ++;
		this._scriptLoader.load(anyModuleIdResolver.moduleIdToPath(moduleId), this._onLoad.bind(this, moduleId), this._onLoadError.bind(this, moduleId));
	};
	
	ModuleManager.prototype._resolve = function (module) {
		/// <summary>
		///   Examine the dependencies of module 'module'
		///   and resolve them as needed.
		/// </summary>
		var i, len, id, dependencies, dependencyId, moduleIdResolver;
		
		id = module.getId();
		dependencies = module.getDependencies();
		moduleIdResolver = module.getModuleIdResolver();
		
		this._dependencies[id] = [];
		
		for (i = 0, len = dependencies.length; i < len; i++) {
			dependencyId = dependencies[i];
			
			if (dependencyId === 'require') {
				module.resolveDependency(dependencyId, this._createRequire(moduleIdResolver));
				continue;
			} else {
				if (dependencyId.indexOf('!') >= 0) {
					this._resolvePluginDependency(id, dependencyId);
				} else {
					this._resolveDependency(id, dependencyId, this._loadModule.bind(this, moduleIdResolver));
				}
			}
		}
		
		if (module.isComplete()) {
			// This module was completed as soon as its been seen.
			this._onModuleComplete(id, module.getExports());
		}
	};
	
	

	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// BrowserScriptLoader
	
	function BrowserScriptLoader() {
	}
	
	BrowserScriptLoader.prototype.attachListeners = (function() {
		if (global.attachEvent) {
			return function (script, callback, errorback) {
				var loadEventListener = null, errorEventListener = null;
				
				var unbind = function () {
					script.detachEvent('onreadystatechange', loadEventListener);
					if (script.addEventListener) {
						script.removeEventListener('error', errorEventListener);
					}
				};
				
				loadEventListener = function (e) {
					if (script.readyState === 'loaded' || script.readyState === 'complete') {
						unbind();
						callback();
					}
				};
				
				errorEventListener = function (e) {
					unbind();
					errorback(e);
				};
				
				script.attachEvent('onreadystatechange', loadEventListener);
				if (script.addEventListener) {
					script.addEventListener('error', errorEventListener);
				}
			};
		} else {
			return function (script, callback, errorback) {
				var loadEventListener = null, errorEventListener = null;
				
				var unbind = function () {
					script.removeEventListener('load', loadEventListener);
					script.removeEventListener('error', errorEventListener);
				};
				
				loadEventListener = function (e) {
					unbind();
					callback();
				};
				
				errorEventListener = function (e) {
					unbind();
					errorback(e);
				};
				
				script.addEventListener('load',  loadEventListener);
				script.addEventListener('error', errorEventListener);
			};
		}
	})();
	
	BrowserScriptLoader.prototype.load = function (scriptSrc, callback, errorback) {
		var script = document.createElement('script');
		script.setAttribute('async', 'async');
		script.setAttribute('type', 'text/javascript');
		
		this.attachListeners(script, callback, errorback);
		
		script.setAttribute('src', scriptSrc);
		
		document.getElementsByTagName('head')[0].appendChild(script);
	};

	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// WorkerScriptLoader
	
	function WorkerScriptLoader() {
		this.loadCalls = [];
		this.loadTimeout = -1;
	}
	
	WorkerScriptLoader.prototype.load = function (scriptSrc, callback, errorback) {
		this.loadCalls.push({
			scriptSrc: scriptSrc,
			callback: callback,
			errorback: errorback
		});
		
		if (navigator.userAgent.indexOf('Firefox') >= 0) {
			// Firefox fails installing the timer every now and then :(
			this._load();
		} else {
			if (this.loadTimeout === -1) {
				this.loadTimeout = setTimeout(this._load.bind(this), 0);
			}
		}
	};
	
	WorkerScriptLoader.prototype._load = function () {
		this.loadTimeout = -1;
		
		var loadCalls = this.loadCalls;
		this.loadCalls = [];
		
		var i, len = loadCalls.length, scripts = [];
		
		for (i = 0; i < len; i++) {
			scripts.push(loadCalls[i].scriptSrc);
		}
		
		try {
			importScripts.apply(null, scripts);
		
			for (i = 0; i < len; i++) {
				loadCalls[i].callback();
			}
		} catch (e) {
			for (i = 0; i < len; i++) {
				loadCalls[i].errorback(e);
			}
		}
	};
	
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// define
	
	var scriptLoader = isWebWorker ? new WorkerScriptLoader() : new BrowserScriptLoader();
	var moduleManager = new ModuleManager(scriptLoader);
	
	function define(id, dependencies, callback) {
		if (typeof id !== 'string') {
			callback = dependencies;
			dependencies = id;
			id = null;
		}
		if (typeof dependencies !== 'object' || !(dependencies instanceof Array)) {
			callback = dependencies;
			dependencies = null;
		}
		if (!dependencies) {
			dependencies = [];
		}
		// Special case for jQuery which always registers itself with 'jquery'
		if (!!id && id !== 'jquery') {
			moduleManager.enqueueDefineModule(id, dependencies, callback);
		} else {
			moduleManager.enqueueDefineAnonymousModule(dependencies, callback);
		}
	}
	
	function configure(params, shouldOverwrite) {
		if (shouldOverwrite) {
			moduleManager.setConfig(new Configuration(params));
		} else {
			var currentConfig = moduleManager.getConfig();
			moduleManager.setConfig(currentConfig.cloneAndMerge(params));
		}
	}
	
	function require() {
		if (arguments.length === 1) {
			if ((arguments[0] instanceof Object) && !(arguments[0] instanceof Array)) {
				configure(arguments[0]);
				return;
			}
			if (typeof arguments[0] === 'string') {
				return moduleManager.synchronousRequire(arguments[0]);
			}
		}
		if (arguments.length === 2) {
			if (arguments[0] instanceof Array) {
				moduleManager.defineModule(anonymousModuleGenerator(), arguments[0], arguments[1]);
				return;
			}
		}
		throw new Error('Unrecognized require call');
	}
	require.config = configure;
	
	if (!isWebWorker) {
		window.onload = function () {
			var i, len, script, main, scripts = document.getElementsByTagName('script');
			
			// Look through all the scripts for the data-main attribute
			for (i = 0, len = scripts.length; i < len; i++) {
				script = scripts[i];
				main = script.getAttribute('data-main');
				if (main) {
					break;
				}
			}
			
			// Load the main script
			if (main) {
				moduleManager.defineModule(anonymousModuleGenerator(), [main], null, new ModuleIdResolver(new Configuration(), ''));
			}
		};
	}
	
	define.amd = {
		jQuery: true
	};
	global.define = define;
	
	// The global variable require can configure the loader
	if (typeof global.require !== 'undefined' && Object.prototype.toString.call(global.require) !== '[object Function]') {
		require.config(global.require);
	}
	global.require = require;
	
})(this);