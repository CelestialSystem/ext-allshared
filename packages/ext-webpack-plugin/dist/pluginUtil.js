"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._constructor = _constructor;
exports._thisCompilation = _thisCompilation;
exports._compilation = _compilation;
exports._afterCompile = _afterCompile;
exports._emit = _emit;
exports._done = _done;
exports._prepareForBuild = _prepareForBuild;
exports._buildExtBundle = _buildExtBundle;
exports._executeAsync = _executeAsync;
exports._toXtype = _toXtype;
exports._getApp = _getApp;
exports._getVersions = _getVersions;
exports.log = log;
exports.logh = logh;
exports.logv = logv;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//**********
function _constructor(initialOptions) {
  const fs = require('fs');

  var vars = {};
  var options = {};

  try {
    if (initialOptions.framework == undefined) {
      vars.pluginErrors = [];
      vars.pluginErrors.push('webpack config: framework parameter on ext-webpack-plugin is not defined - values: react, angular, extjs, web-components');
      var result = {
        vars: vars
      };
      return result;
    }

    var framework = initialOptions.framework;
    var treeshake = initialOptions.treeshake;
    var verbose = initialOptions.verbose;

    const validateOptions = require('schema-utils');

    validateOptions(_getValidateOptions(), initialOptions, '');
    const rc = fs.existsSync(`.ext-${framework}rc`) && JSON.parse(fs.readFileSync(`.ext-${framework}rc`, 'utf-8')) || {};
    options = _objectSpread({}, _getDefaultOptions(), {}, initialOptions, {}, rc);
    vars = require(`./${framework}Util`)._getDefaultVars();
    vars.pluginName = 'ext-webpack-plugin';
    vars.app = _getApp();
    var pluginName = vars.pluginName;
    var app = vars.app;
    logv(verbose, 'FUNCTION _constructor');
    logv(verbose, `pluginName - ${pluginName}`);
    logv(verbose, `app - ${app}`);

    if (options.environment == 'production') {
      vars.production = true;
      options.browser = 'no';
      options.watch = 'no';
    } else {
      vars.production = false;
    }

    log(app, _getVersions(pluginName, framework)); //mjg added for angular cli build

    if (framework == 'angular' && options.intellishake == 'no' && vars.production == true && treeshake == 'yes') {
      vars.buildstep = '1 of 1';
      log(app, 'Starting production build for ' + framework);
    } else if (framework == 'react' || framework == 'extjs' || framework == 'web-components') {
      if (vars.production == true) {
        vars.buildstep = '1 of 1';
        log(app, 'Starting production build for ' + framework);
      } else {
        vars.buildstep = '1 of 1';
        log(app, 'Starting development build for ' + framework);
      }
    } else if (vars.production == true) {
      if (treeshake == 'yes') {
        vars.buildstep = '1 of 2';
        log(app, 'Starting production build for ' + framework + ' - ' + vars.buildstep);

        require(`./${framework}Util`)._toProd(vars, options);
      } else {
        vars.buildstep = '2 of 2';
        log(app, 'Continuing production build for ' + framework + ' - ' + vars.buildstep);
      }
    } else {
      vars.buildstep = '1 of 1';
      log(app, 'Starting development build for ' + framework);
    }

    logv(verbose, 'Building for ' + options.environment + ', ' + 'treeshake is ' + options.treeshake + ', ' + 'intellishake is ' + options.intellishake);
    var configObj = {
      vars: vars,
      options: options
    };
    return configObj;
  } catch (e) {
    throw '_constructor: ' + e.toString();
  }
} //**********


function _thisCompilation(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    logv(verbose, 'FUNCTION _thisCompilation');
    logv(verbose, `options.script: ${options.script}`);
    logv(verbose, `buildstep: ${vars.buildstep}`);

    if (vars.buildstep === '1 of 1' || vars.buildstep === '1 of 2') {
      if (options.script != undefined && options.script != null && options.script != '') {
        log(app, `Started running ${options.script}`);
        runScript(options.script, function (err) {
          if (err) {
            throw err;
          }

          log(app, `Finished running ${options.script}`);
        });
      }
    }
  } catch (e) {
    throw '_thisCompilation: ' + e.toString();
  }
} //**********


function _compilation(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _compilation');

    if (framework != 'extjs') {
      if (options.treeshake === 'yes' && options.environment === 'production') {
        var extComponents = []; //mjg for 1 step build

        if (vars.buildstep == '1 of 1' && framework === 'angular' && options.intellishake == 'no') {
          extComponents = require(`./${framework}Util`)._getAllComponents(vars, options);
        }

        if (vars.buildstep == '1 of 2' || vars.buildstep == '1 of 1' && framework === 'web-components') {
          extComponents = require(`./${framework}Util`)._getAllComponents(vars, options);
        }

        compilation.hooks.succeedModule.tap(`ext-succeed-module`, module => {
          if (module.resource && !module.resource.match(/node_modules/)) {
            try {
              if (module.resource.match(/\.html$/) != null && module._source._value.toLowerCase().includes('doctype html') == false) {
                vars.deps = [...(vars.deps || []), ...require(`./${framework}Util`)._extractFromSource(module, options, compilation, extComponents)];
              } else {
                vars.deps = [...(vars.deps || []), ...require(`./${framework}Util`)._extractFromSource(module, options, compilation, extComponents)];
              }
            } catch (e) {
              console.log(e);
            }
          }
        });
      }

      if (vars.buildstep == '1 of 2') {
        compilation.hooks.finishModules.tap(`ext-finish-modules`, modules => {
          require(`./${framework}Util`)._writeFilesToProdFolder(vars, options);
        });
      }

      if (vars.buildstep == '1 of 1' || vars.buildstep == '2 of 2') {
        if (options.inject === 'yes') {
          compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`, data => {
            const path = require('path');

            var jsPath = path.join(vars.extPath, 'ext.js');
            var cssPath = path.join(vars.extPath, 'ext.css'); //var jsPath = vars.extPath + '/' +  'ext.js';
            //var cssPath = vars.extPath + '/' + 'ext.css';

            data.assets.js.unshift(jsPath);
            data.assets.css.unshift(cssPath);
            log(app, `Adding ${jsPath} and ${cssPath} to index.html`);
          });
        }
      }
    }
  } catch (e) {
    throw '_compilation: ' + e.toString(); //    logv(options.verbose,e)
    //    compilation.errors.push('_compilation: ' + e)
  }
} //**********


function _afterCompile(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _afterCompile');

    if (framework == 'extjs') {
      require(`./extjsUtil`)._afterCompile(compilation, vars, options);
    } else {
      logv(verbose, 'FUNCTION _afterCompile not run');
    }
  } catch (e) {
    throw '_afterCompile: ' + e.toString();
  }
} //**********


function _emit(_x, _x2, _x3, _x4, _x5) {
  return _emit2.apply(this, arguments);
} //**********


function _emit2() {
  _emit2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var path, app, verbose, emit, framework, outputPath, command, parms;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          path = require('path');
          app = vars.app;
          verbose = options.verbose;
          emit = options.emit;
          framework = options.framework;
          logv(verbose, 'FUNCTION _emit');

          if (!(emit == 'yes')) {
            _context.next = 33;
            break;
          }

          if (!(vars.buildstep == '1 of 1' || vars.buildstep == '1 of 2')) {
            _context.next = 29;
            break;
          }

          outputPath = path.join(compiler.outputPath, vars.extPath);

          if (compiler.outputPath === '/' && compiler.options.devServer) {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          }

          logv(verbose, 'outputPath: ' + outputPath);
          logv(verbose, 'framework: ' + framework);

          if (framework != 'extjs') {
            _prepareForBuild(app, vars, options, outputPath, compilation);
          }

          command = '';

          if (options.watch == 'yes' && vars.production == false) {
            command = 'watch';
          } else {
            command = 'build';
          }

          if (!(vars.rebuild == true)) {
            _context.next = 26;
            break;
          }

          parms = [];

          if (options.profile == undefined || options.profile == '' || options.profile == null) {
            if (command == 'build') {
              parms = ['app', command, options.environment];
            } else {
              parms = ['app', command, '--web-server', 'false', options.environment];
            }
          } else {
            if (command == 'build') {
              parms = ['app', command, options.profile, options.environment];
            } else {
              parms = ['app', command, '--web-server', 'false', options.profile, options.environment];
            }
          }

          if (!(vars.watchStarted == false)) {
            _context.next = 23;
            break;
          }

          _context.next = 22;
          return _buildExtBundle(app, compilation, outputPath, parms, vars, options);

        case 22:
          vars.watchStarted = true;

        case 23:
          callback();
          _context.next = 27;
          break;

        case 26:
          callback();

        case 27:
          _context.next = 31;
          break;

        case 29:
          logv(verbose, 'NOT running emit');
          callback();

        case 31:
          _context.next = 35;
          break;

        case 33:
          logv(verbose, 'emit is no');
          callback();

        case 35:
          _context.next = 41;
          break;

        case 37:
          _context.prev = 37;
          _context.t0 = _context["catch"](0);
          callback();
          throw '_emit: ' + _context.t0.toString();

        case 41:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 37]]);
  }));
  return _emit2.apply(this, arguments);
}

function _done(stats, vars, options) {
  try {
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _done');

    if (stats.compilation.errors && stats.compilation.errors.length) // && process.argv.indexOf('--watch') == -1)
      {
        var chalk = require('chalk');

        console.log(chalk.red('******************************************'));
        console.log(stats.compilation.errors[0]);
        console.log(chalk.red('******************************************'));
        process.exit(0);
      } //mjg refactor


    if (vars.production == true && options.treeshake == 'no' && framework == 'angular') {
      require(`./${options.framework}Util`)._toDev(vars, options);
    }

    try {
      if (options.browser == 'yes' && options.watch == 'yes' && vars.production == false) {
        if (vars.browserCount == 0) {
          var url = 'http://localhost:' + options.port;

          require('./pluginUtil').log(vars.app, `Opening browser at ${url}`);

          vars.browserCount++;

          const opn = require('opn');

          opn(url);
        }
      }
    } catch (e) {
      console.log(e);
    }

    if (vars.buildstep == '1 of 1') {
      if (vars.production == true) {
        require('./pluginUtil').log(vars.app, `Ending production build for ${framework}`);
      } else {
        require('./pluginUtil').log(vars.app, `Ending development build for ${framework}`);
      }
    }

    if (vars.buildstep == '2 of 2') {
      require('./pluginUtil').log(vars.app, `Ending production build for ${framework}`);
    }
  } catch (e) {
    //    require('./pluginUtil').logv(options.verbose,e)
    throw '_done: ' + e.toString();
  }
} //**********


function _prepareForBuild(app, vars, options, output, compilation) {
  try {
    var verbose = options.verbose;
    var packages = options.packages;
    var toolkit = options.toolkit;
    var theme = options.theme;
    logv(verbose, 'FUNCTION _prepareForBuild');

    const rimraf = require('rimraf');

    const mkdirp = require('mkdirp');

    const fsx = require('fs-extra');

    const fs = require('fs');

    const path = require('path');

    theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material');
    logv(verbose, 'firstTime: ' + vars.firstTime);

    if (vars.firstTime) {
      rimraf.sync(output);
      mkdirp.sync(output);

      const buildXML = require('./artifacts').buildXML;

      const createAppJson = require('./artifacts').createAppJson;

      const createWorkspaceJson = require('./artifacts').createWorkspaceJson;

      const createJSDOMEnvironment = require('./artifacts').createJSDOMEnvironment;

      fs.writeFileSync(path.join(output, 'build.xml'), buildXML(vars.production, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(options, output), 'utf8');
      var framework = vars.framework; //because of a problem with colorpicker

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/ux/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/ux/`);
        var toPath = path.join(output, 'ux');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying (ux) ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/packages/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/packages/`);
        var toPath = path.join(output, 'packages');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/overrides/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/overrides/`);
        var toPath = path.join(output, 'overrides');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/');
        var toResources = path.join(output, '../resources');
        fsx.copySync(fromResources, toResources);
        log(app, 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
      }
    }

    vars.firstTime = false;
    var js = '';

    if (vars.production) {
      vars.deps = vars.deps.filter(function (value, index) {
        return vars.deps.indexOf(value) == index;
      });
      js = vars.deps.join(';\n');
    } else {
      js = `Ext.require(["Ext.*","Ext.data.TreeStore"])`;
    }

    if (vars.manifest === null || js !== vars.manifest) {
      vars.manifest = js + ';\nExt.require(["Ext.layout.*"]);\n';
      const manifest = path.join(output, 'manifest.js');
      fs.writeFileSync(manifest, vars.manifest, 'utf8');
      vars.rebuild = true;
      var bundleDir = output.replace(process.cwd(), '');

      if (bundleDir.trim() == '') {
        bundleDir = './';
      }

      log(app, 'Building Ext bundle at: ' + bundleDir);
    } else {
      vars.rebuild = false;
      log(app, 'Ext rebuild NOT needed');
    }
  } catch (e) {
    require('./pluginUtil').logv(options.verbose, e);

    compilation.errors.push('_prepareForBuild: ' + e);
  }
} //**********


function _buildExtBundle(app, compilation, outputPath, parms, vars, options) {
  //  try {
  var verbose = options.verbose;

  const fs = require('fs');

  logv(verbose, 'FUNCTION _buildExtBundle');
  let sencha;

  try {
    sencha = require('@sencha/cmd');
  } catch (e) {
    sencha = 'sencha';
  }

  if (fs.existsSync(sencha)) {
    logv(verbose, 'sencha folder exists');
  } else {
    logv(verbose, 'sencha folder DOES NOT exist');
  }

  return new Promise((resolve, reject) => {
    const onBuildDone = () => {
      logv(verbose, 'onBuildDone');
      resolve();
    };

    var opts = {
      cwd: outputPath,
      silent: true,
      stdio: 'pipe',
      encoding: 'utf-8'
    };

    _executeAsync(app, sencha, parms, opts, compilation, vars, options).then(function () {
      onBuildDone();
    }, function (reason) {
      reject(reason);
    });
  }); // }
  // catch(e) {
  //   console.log('e')
  //   require('./pluginUtil').logv(options.verbose,e)
  //   compilation.errors.push('_buildExtBundle: ' + e)
  //   callback()
  // }
} //**********


function _executeAsync(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
  return _executeAsync2.apply(this, arguments);
} //**********


function _executeAsync2() {
  _executeAsync2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(app, command, parms, opts, compilation, vars, options) {
    var verbose, framework, DEFAULT_SUBSTRS, substrings, chalk, crossSpawn;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          //  try {
          verbose = options.verbose;
          framework = options.framework; //const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Processing', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];

          DEFAULT_SUBSTRS = ["[INF] xServer", '[INF] Loading', '[INF] Append', '[INF] Processing', '[INF] Processing Build', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          substrings = DEFAULT_SUBSTRS;
          chalk = require('chalk');
          crossSpawn = require('cross-spawn');
          logv(verbose, 'FUNCTION _executeAsync');
          _context2.next = 9;
          return new Promise((resolve, reject) => {
            logv(verbose, `command - ${command}`);
            logv(verbose, `parms - ${parms}`);
            logv(verbose, `opts - ${JSON.stringify(opts)}`);
            let child = crossSpawn(command, parms, opts);
            child.on('close', (code, signal) => {
              logv(verbose, `on close: ` + code);

              if (code === 0) {
                resolve(0);
              } else {
                compilation.errors.push(new Error(code));
                resolve(0);
              }
            });
            child.on('error', error => {
              logv(verbose, `on error`);
              compilation.errors.push(error);
              resolve(0);
            });
            child.stdout.on('data', data => {
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              logv(verbose, `${str}`);

              if (data && data.toString().match(/Fashion waiting for changes\.\.\./)) {
                const fs = require('fs');

                var filename = process.cwd() + vars.touchFile;

                try {
                  var d = new Date().toLocaleString();
                  var data = fs.readFileSync(filename);
                  fs.writeFileSync(filename, '//' + d, 'utf8');
                  logv(app, `touching ${filename}`);
                } catch (e) {
                  logv(app, `NOT touching ${filename}`);
                }

                resolve(0);
              } else {
                if (substrings.some(function (v) {
                  return data.indexOf(v) >= 0;
                })) {
                  str = str.replace("[INF]", "");
                  str = str.replace("[LOG]", "");
                  str = str.replace(process.cwd(), '').trim();

                  if (str.includes("[ERR]")) {
                    compilation.errors.push(app + str.replace(/^\[ERR\] /gi, ''));
                    str = str.replace("[ERR]", `${chalk.red("[ERR]")}`);
                  }

                  log(app, str);
                }
              }
            });
            child.stderr.on('data', data => {
              logv(options, `error on close: ` + data);
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              var strJavaOpts = "Picked up _JAVA_OPTIONS";
              var includes = str.includes(strJavaOpts);

              if (!includes) {
                console.log(`${app} ${chalk.red("[ERR]")} ${str}`);
              }
            });
          });

        case 9:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _executeAsync2.apply(this, arguments);
}

function runScript(scriptPath, callback) {
  var childProcess = require('child_process'); // keep track of whether callback has been invoked to prevent multiple invocations


  var invoked = false;
  var process = childProcess.fork(scriptPath); // listen for errors as they may prevent the exit event from firing

  process.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  }); // execute the callback once the process has finished running

  process.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });
} //**********


function _toXtype(str) {
  return str.toLowerCase().replace(/_/g, '-');
} //**********


function _getApp() {
  var chalk = require('chalk');

  var prefix = ``;

  const platform = require('os').platform();

  if (platform == 'darwin') {
    prefix = `ℹ ｢ext｣:`;
  } else {
    prefix = `i [ext]:`;
  }

  return `${chalk.green(prefix)} `;
} //**********


function _getVersions(pluginName, frameworkName) {
  try {
    const path = require('path');

    const fs = require('fs');

    var v = {};
    var frameworkInfo = 'n/a';
    v.pluginVersion = 'n/a';
    v.extVersion = 'n/a';
    v.edition = 'n/a';
    v.cmdVersion = 'n/a';
    v.webpackVersion = 'n/a';
    var pluginPath = path.resolve(process.cwd(), 'node_modules/@sencha', pluginName);
    var pluginPkg = fs.existsSync(pluginPath + '/package.json') && JSON.parse(fs.readFileSync(pluginPath + '/package.json', 'utf-8')) || {};
    v.pluginVersion = pluginPkg.version;
    v._resolved = pluginPkg._resolved;

    if (v._resolved == undefined) {
      v.edition = `Commercial`;
    } else {
      if (-1 == v._resolved.indexOf('community')) {
        v.edition = `Commercial`;
      } else {
        v.edition = `Community`;
      }
    }

    var webpackPath = path.resolve(process.cwd(), 'node_modules/webpack');
    var webpackPkg = fs.existsSync(webpackPath + '/package.json') && JSON.parse(fs.readFileSync(webpackPath + '/package.json', 'utf-8')) || {};
    v.webpackVersion = webpackPkg.version;
    var extPath = path.resolve(process.cwd(), 'node_modules/@sencha/ext');
    var extPkg = fs.existsSync(extPath + '/package.json') && JSON.parse(fs.readFileSync(extPath + '/package.json', 'utf-8')) || {};
    v.extVersion = extPkg.sencha.version;
    var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/cmd`);
    var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
    v.cmdVersion = cmdPkg.version_full;

    if (v.cmdVersion == undefined) {
      var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/${pluginName}/node_modules/@sencha/cmd`);
      var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
      v.cmdVersion = cmdPkg.version_full;
    }

    if (frameworkName != undefined && frameworkName != 'extjs') {
      var frameworkPath = '';

      if (frameworkName == 'react') {
        frameworkPath = path.resolve(process.cwd(), 'node_modules/react');
      }

      if (frameworkName == 'angular') {
        frameworkPath = path.resolve(process.cwd(), 'node_modules/@angular/core');
      }

      var frameworkPkg = fs.existsSync(frameworkPath + '/package.json') && JSON.parse(fs.readFileSync(frameworkPath + '/package.json', 'utf-8')) || {};
      v.frameworkVersion = frameworkPkg.version;

      if (v.frameworkVersion == undefined) {
        frameworkInfo = ', ' + frameworkName;
      } else {
        frameworkInfo = ', ' + frameworkName + ' v' + v.frameworkVersion;
      }
    }

    return 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
  } catch (e) {
    return 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
  }
} //**********


function log(app, message) {
  var s = app + message;

  require('readline').cursorTo(process.stdout, 0);

  try {
    process.stdout.clearLine();
  } catch (e) {}

  process.stdout.write(s);
  process.stdout.write('\n');
} //**********


function logh(app, message) {
  var h = false;
  var s = app + message;

  if (h == true) {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(s);
    process.stdout.write('\n');
  }
} //**********


function logv(verbose, s) {
  if (verbose == 'yes') {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(`-verbose: ${s}`);
    process.stdout.write('\n');
  }
}

function _getValidateOptions() {
  return {
    "type": "object",
    "properties": {
      "framework": {
        "type": ["string"]
      },
      "toolkit": {
        "type": ["string"]
      },
      "theme": {
        "type": ["string"]
      },
      "emit": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "script": {
        "type": ["string"]
      },
      "port": {
        "type": ["integer"]
      },
      "packages": {
        "type": ["string", "array"]
      },
      "profile": {
        "type": ["string"]
      },
      "environment": {
        "errorMessage": "should be 'development' or 'production' string value",
        "type": ["string"]
      },
      "treeshake": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "browser": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "watch": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "verbose": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "inject": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "intellishake": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      }
    },
    "additionalProperties": false
  };
}

function _getDefaultOptions() {
  return {
    framework: 'extjs',
    toolkit: 'modern',
    theme: 'theme-material',
    emit: 'yes',
    script: null,
    port: 1962,
    packages: [],
    profile: '',
    environment: 'development',
    treeshake: 'no',
    browser: 'yes',
    watch: 'yes',
    verbose: 'no',
    inject: 'yes',
    intellishake: 'yes'
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsImluaXRpYWxPcHRpb25zIiwiZnMiLCJyZXF1aXJlIiwidmFycyIsIm9wdGlvbnMiLCJmcmFtZXdvcmsiLCJ1bmRlZmluZWQiLCJwbHVnaW5FcnJvcnMiLCJwdXNoIiwicmVzdWx0IiwidHJlZXNoYWtlIiwidmVyYm9zZSIsInZhbGlkYXRlT3B0aW9ucyIsIl9nZXRWYWxpZGF0ZU9wdGlvbnMiLCJyYyIsImV4aXN0c1N5bmMiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJfZ2V0RGVmYXVsdE9wdGlvbnMiLCJfZ2V0RGVmYXVsdFZhcnMiLCJwbHVnaW5OYW1lIiwiYXBwIiwiX2dldEFwcCIsImxvZ3YiLCJlbnZpcm9ubWVudCIsInByb2R1Y3Rpb24iLCJicm93c2VyIiwid2F0Y2giLCJsb2ciLCJfZ2V0VmVyc2lvbnMiLCJpbnRlbGxpc2hha2UiLCJidWlsZHN0ZXAiLCJfdG9Qcm9kIiwiY29uZmlnT2JqIiwiZSIsInRvU3RyaW5nIiwiX3RoaXNDb21waWxhdGlvbiIsImNvbXBpbGVyIiwiY29tcGlsYXRpb24iLCJzY3JpcHQiLCJydW5TY3JpcHQiLCJlcnIiLCJfY29tcGlsYXRpb24iLCJleHRDb21wb25lbnRzIiwiX2dldEFsbENvbXBvbmVudHMiLCJob29rcyIsInN1Y2NlZWRNb2R1bGUiLCJ0YXAiLCJtb2R1bGUiLCJyZXNvdXJjZSIsIm1hdGNoIiwiX3NvdXJjZSIsIl92YWx1ZSIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJkZXBzIiwiX2V4dHJhY3RGcm9tU291cmNlIiwiY29uc29sZSIsImZpbmlzaE1vZHVsZXMiLCJtb2R1bGVzIiwiX3dyaXRlRmlsZXNUb1Byb2RGb2xkZXIiLCJpbmplY3QiLCJodG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uIiwiZGF0YSIsInBhdGgiLCJqc1BhdGgiLCJqb2luIiwiZXh0UGF0aCIsImNzc1BhdGgiLCJhc3NldHMiLCJqcyIsInVuc2hpZnQiLCJjc3MiLCJfYWZ0ZXJDb21waWxlIiwiX2VtaXQiLCJjYWxsYmFjayIsImVtaXQiLCJvdXRwdXRQYXRoIiwiZGV2U2VydmVyIiwiY29udGVudEJhc2UiLCJfcHJlcGFyZUZvckJ1aWxkIiwiY29tbWFuZCIsInJlYnVpbGQiLCJwYXJtcyIsInByb2ZpbGUiLCJ3YXRjaFN0YXJ0ZWQiLCJfYnVpbGRFeHRCdW5kbGUiLCJfZG9uZSIsInN0YXRzIiwiZXJyb3JzIiwibGVuZ3RoIiwiY2hhbGsiLCJyZWQiLCJwcm9jZXNzIiwiZXhpdCIsIl90b0RldiIsImJyb3dzZXJDb3VudCIsInVybCIsInBvcnQiLCJvcG4iLCJvdXRwdXQiLCJwYWNrYWdlcyIsInRvb2xraXQiLCJ0aGVtZSIsInJpbXJhZiIsIm1rZGlycCIsImZzeCIsImZpcnN0VGltZSIsInN5bmMiLCJidWlsZFhNTCIsImNyZWF0ZUFwcEpzb24iLCJjcmVhdGVXb3Jrc3BhY2VKc29uIiwiY3JlYXRlSlNET01FbnZpcm9ubWVudCIsIndyaXRlRmlsZVN5bmMiLCJjd2QiLCJmcm9tUGF0aCIsInRvUGF0aCIsImNvcHlTeW5jIiwicmVwbGFjZSIsImZyb21SZXNvdXJjZXMiLCJ0b1Jlc291cmNlcyIsImZpbHRlciIsInZhbHVlIiwiaW5kZXgiLCJpbmRleE9mIiwibWFuaWZlc3QiLCJidW5kbGVEaXIiLCJ0cmltIiwic2VuY2hhIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJvbkJ1aWxkRG9uZSIsIm9wdHMiLCJzaWxlbnQiLCJzdGRpbyIsImVuY29kaW5nIiwiX2V4ZWN1dGVBc3luYyIsInRoZW4iLCJyZWFzb24iLCJERUZBVUxUX1NVQlNUUlMiLCJzdWJzdHJpbmdzIiwiY3Jvc3NTcGF3biIsInN0cmluZ2lmeSIsImNoaWxkIiwib24iLCJjb2RlIiwic2lnbmFsIiwiRXJyb3IiLCJlcnJvciIsInN0ZG91dCIsInN0ciIsImZpbGVuYW1lIiwidG91Y2hGaWxlIiwiZCIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInNvbWUiLCJ2Iiwic3RkZXJyIiwic3RySmF2YU9wdHMiLCJzY3JpcHRQYXRoIiwiY2hpbGRQcm9jZXNzIiwiaW52b2tlZCIsImZvcmsiLCJfdG9YdHlwZSIsInByZWZpeCIsInBsYXRmb3JtIiwiZ3JlZW4iLCJmcmFtZXdvcmtOYW1lIiwiZnJhbWV3b3JrSW5mbyIsInBsdWdpblZlcnNpb24iLCJleHRWZXJzaW9uIiwiZWRpdGlvbiIsImNtZFZlcnNpb24iLCJ3ZWJwYWNrVmVyc2lvbiIsInBsdWdpblBhdGgiLCJwbHVnaW5Qa2ciLCJ2ZXJzaW9uIiwiX3Jlc29sdmVkIiwid2VicGFja1BhdGgiLCJ3ZWJwYWNrUGtnIiwiZXh0UGtnIiwiY21kUGF0aCIsImNtZFBrZyIsInZlcnNpb25fZnVsbCIsImZyYW1ld29ya1BhdGgiLCJmcmFtZXdvcmtQa2ciLCJmcmFtZXdvcmtWZXJzaW9uIiwibWVzc2FnZSIsInMiLCJjdXJzb3JUbyIsImNsZWFyTGluZSIsIndyaXRlIiwibG9naCIsImgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTtBQUNPLFNBQVNBLFlBQVQsQ0FBc0JDLGNBQXRCLEVBQXNDO0FBQzNDLFFBQU1DLEVBQUUsR0FBR0MsT0FBTyxDQUFDLElBQUQsQ0FBbEI7O0FBQ0EsTUFBSUMsSUFBSSxHQUFHLEVBQVg7QUFDQSxNQUFJQyxPQUFPLEdBQUcsRUFBZDs7QUFDQSxNQUFJO0FBQ0YsUUFBSUosY0FBYyxDQUFDSyxTQUFmLElBQTRCQyxTQUFoQyxFQUEyQztBQUN6Q0gsTUFBQUEsSUFBSSxDQUFDSSxZQUFMLEdBQW9CLEVBQXBCO0FBQ0FKLE1BQUFBLElBQUksQ0FBQ0ksWUFBTCxDQUFrQkMsSUFBbEIsQ0FBdUIsMEhBQXZCO0FBQ0EsVUFBSUMsTUFBTSxHQUFHO0FBQUVOLFFBQUFBLElBQUksRUFBRUE7QUFBUixPQUFiO0FBQ0EsYUFBT00sTUFBUDtBQUNEOztBQUNELFFBQUlKLFNBQVMsR0FBR0wsY0FBYyxDQUFDSyxTQUEvQjtBQUNBLFFBQUlLLFNBQVMsR0FBR1YsY0FBYyxDQUFDVSxTQUEvQjtBQUNBLFFBQUlDLE9BQU8sR0FBR1gsY0FBYyxDQUFDVyxPQUE3Qjs7QUFFQSxVQUFNQyxlQUFlLEdBQUdWLE9BQU8sQ0FBQyxjQUFELENBQS9COztBQUNBVSxJQUFBQSxlQUFlLENBQUNDLG1CQUFtQixFQUFwQixFQUF3QmIsY0FBeEIsRUFBd0MsRUFBeEMsQ0FBZjtBQUVBLFVBQU1jLEVBQUUsR0FBSWIsRUFBRSxDQUFDYyxVQUFILENBQWUsUUFBT1YsU0FBVSxJQUFoQyxLQUF3Q1csSUFBSSxDQUFDQyxLQUFMLENBQVdoQixFQUFFLENBQUNpQixZQUFILENBQWlCLFFBQU9iLFNBQVUsSUFBbEMsRUFBdUMsT0FBdkMsQ0FBWCxDQUF4QyxJQUF1RyxFQUFuSDtBQUNBRCxJQUFBQSxPQUFPLHFCQUFRZSxrQkFBa0IsRUFBMUIsTUFBaUNuQixjQUFqQyxNQUFvRGMsRUFBcEQsQ0FBUDtBQUVBWCxJQUFBQSxJQUFJLEdBQUdELE9BQU8sQ0FBRSxLQUFJRyxTQUFVLE1BQWhCLENBQVAsQ0FBOEJlLGVBQTlCLEVBQVA7QUFDQWpCLElBQUFBLElBQUksQ0FBQ2tCLFVBQUwsR0FBa0Isb0JBQWxCO0FBQ0FsQixJQUFBQSxJQUFJLENBQUNtQixHQUFMLEdBQVdDLE9BQU8sRUFBbEI7QUFDQSxRQUFJRixVQUFVLEdBQUdsQixJQUFJLENBQUNrQixVQUF0QjtBQUNBLFFBQUlDLEdBQUcsR0FBR25CLElBQUksQ0FBQ21CLEdBQWY7QUFFQUUsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVUsdUJBQVYsQ0FBSjtBQUNBYSxJQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBVyxnQkFBZVUsVUFBVyxFQUFyQyxDQUFKO0FBQ0FHLElBQUFBLElBQUksQ0FBQ2IsT0FBRCxFQUFXLFNBQVFXLEdBQUksRUFBdkIsQ0FBSjs7QUFFQSxRQUFJbEIsT0FBTyxDQUFDcUIsV0FBUixJQUF1QixZQUEzQixFQUF5QztBQUN2Q3RCLE1BQUFBLElBQUksQ0FBQ3VCLFVBQUwsR0FBa0IsSUFBbEI7QUFDQXRCLE1BQUFBLE9BQU8sQ0FBQ3VCLE9BQVIsR0FBa0IsSUFBbEI7QUFDQXZCLE1BQUFBLE9BQU8sQ0FBQ3dCLEtBQVIsR0FBZ0IsSUFBaEI7QUFDRCxLQUpELE1BS0s7QUFDSHpCLE1BQUFBLElBQUksQ0FBQ3VCLFVBQUwsR0FBa0IsS0FBbEI7QUFDRDs7QUFFREcsSUFBQUEsR0FBRyxDQUFDUCxHQUFELEVBQU1RLFlBQVksQ0FBQ1QsVUFBRCxFQUFhaEIsU0FBYixDQUFsQixDQUFILENBcENFLENBc0NGOztBQUNBLFFBQUlBLFNBQVMsSUFBSSxTQUFiLElBQ0FELE9BQU8sQ0FBQzJCLFlBQVIsSUFBd0IsSUFEeEIsSUFFQTVCLElBQUksQ0FBQ3VCLFVBQUwsSUFBbUIsSUFGbkIsSUFHR2hCLFNBQVMsSUFBSSxLQUhwQixFQUcyQjtBQUNuQlAsTUFBQUEsSUFBSSxDQUFDNkIsU0FBTCxHQUFpQixRQUFqQjtBQUNBSCxNQUFBQSxHQUFHLENBQUNQLEdBQUQsRUFBTSxtQ0FBbUNqQixTQUF6QyxDQUFIO0FBQ1AsS0FORCxNQVFLLElBQUlBLFNBQVMsSUFBSSxPQUFiLElBQXdCQSxTQUFTLElBQUksT0FBckMsSUFBZ0RBLFNBQVMsSUFBSSxnQkFBakUsRUFBbUY7QUFDdEYsVUFBSUYsSUFBSSxDQUFDdUIsVUFBTCxJQUFtQixJQUF2QixFQUE2QjtBQUMzQnZCLFFBQUFBLElBQUksQ0FBQzZCLFNBQUwsR0FBaUIsUUFBakI7QUFDQUgsUUFBQUEsR0FBRyxDQUFDUCxHQUFELEVBQU0sbUNBQW1DakIsU0FBekMsQ0FBSDtBQUNELE9BSEQsTUFJSztBQUNIRixRQUFBQSxJQUFJLENBQUM2QixTQUFMLEdBQWlCLFFBQWpCO0FBQ0FILFFBQUFBLEdBQUcsQ0FBQ1AsR0FBRCxFQUFNLG9DQUFvQ2pCLFNBQTFDLENBQUg7QUFDRDtBQUNGLEtBVEksTUFVQSxJQUFJRixJQUFJLENBQUN1QixVQUFMLElBQW1CLElBQXZCLEVBQTZCO0FBQ2hDLFVBQUloQixTQUFTLElBQUksS0FBakIsRUFBd0I7QUFDdEJQLFFBQUFBLElBQUksQ0FBQzZCLFNBQUwsR0FBaUIsUUFBakI7QUFDQUgsUUFBQUEsR0FBRyxDQUFDUCxHQUFELEVBQU0sbUNBQW1DakIsU0FBbkMsR0FBK0MsS0FBL0MsR0FBdURGLElBQUksQ0FBQzZCLFNBQWxFLENBQUg7O0FBQ0E5QixRQUFBQSxPQUFPLENBQUUsS0FBSUcsU0FBVSxNQUFoQixDQUFQLENBQThCNEIsT0FBOUIsQ0FBc0M5QixJQUF0QyxFQUE0Q0MsT0FBNUM7QUFDRCxPQUpELE1BS0s7QUFDSEQsUUFBQUEsSUFBSSxDQUFDNkIsU0FBTCxHQUFpQixRQUFqQjtBQUNBSCxRQUFBQSxHQUFHLENBQUNQLEdBQUQsRUFBTSxxQ0FBcUNqQixTQUFyQyxHQUFpRCxLQUFqRCxHQUF5REYsSUFBSSxDQUFDNkIsU0FBcEUsQ0FBSDtBQUNEO0FBQ0YsS0FWSSxNQVdBO0FBQ0g3QixNQUFBQSxJQUFJLENBQUM2QixTQUFMLEdBQWlCLFFBQWpCO0FBQ0FILE1BQUFBLEdBQUcsQ0FBQ1AsR0FBRCxFQUFNLG9DQUFvQ2pCLFNBQTFDLENBQUg7QUFDRDs7QUFDRG1CLElBQUFBLElBQUksQ0FBQ2IsT0FBRCxFQUFVLGtCQUFrQlAsT0FBTyxDQUFDcUIsV0FBMUIsR0FBd0MsSUFBeEMsR0FBK0MsZUFBL0MsR0FBaUVyQixPQUFPLENBQUNNLFNBQXpFLEdBQW9GLElBQXBGLEdBQTJGLGtCQUEzRixHQUFnSE4sT0FBTyxDQUFDMkIsWUFBbEksQ0FBSjtBQUVBLFFBQUlHLFNBQVMsR0FBRztBQUFFL0IsTUFBQUEsSUFBSSxFQUFFQSxJQUFSO0FBQWNDLE1BQUFBLE9BQU8sRUFBRUE7QUFBdkIsS0FBaEI7QUFDQSxXQUFPOEIsU0FBUDtBQUNELEdBNUVELENBNkVBLE9BQU9DLENBQVAsRUFBVTtBQUNSLFVBQU0sbUJBQW1CQSxDQUFDLENBQUNDLFFBQUYsRUFBekI7QUFDRDtBQUNGLEMsQ0FFRDs7O0FBQ08sU0FBU0MsZ0JBQVQsQ0FBMEJDLFFBQTFCLEVBQW9DQyxXQUFwQyxFQUFpRHBDLElBQWpELEVBQXVEQyxPQUF2RCxFQUFnRTtBQUNyRSxNQUFJO0FBQ0YsUUFBSWtCLEdBQUcsR0FBR25CLElBQUksQ0FBQ21CLEdBQWY7QUFDQSxRQUFJWCxPQUFPLEdBQUdQLE9BQU8sQ0FBQ08sT0FBdEI7QUFDQWEsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVUsMkJBQVYsQ0FBSjtBQUNBYSxJQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBVyxtQkFBa0JQLE9BQU8sQ0FBQ29DLE1BQVEsRUFBN0MsQ0FBSjtBQUNBaEIsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVcsY0FBYVIsSUFBSSxDQUFDNkIsU0FBVSxFQUF2QyxDQUFKOztBQUVBLFFBQUk3QixJQUFJLENBQUM2QixTQUFMLEtBQW1CLFFBQW5CLElBQStCN0IsSUFBSSxDQUFDNkIsU0FBTCxLQUFtQixRQUF0RCxFQUFnRTtBQUM5RCxVQUFJNUIsT0FBTyxDQUFDb0MsTUFBUixJQUFrQmxDLFNBQWxCLElBQStCRixPQUFPLENBQUNvQyxNQUFSLElBQWtCLElBQWpELElBQXlEcEMsT0FBTyxDQUFDb0MsTUFBUixJQUFrQixFQUEvRSxFQUFtRjtBQUNqRlgsUUFBQUEsR0FBRyxDQUFDUCxHQUFELEVBQU8sbUJBQWtCbEIsT0FBTyxDQUFDb0MsTUFBTyxFQUF4QyxDQUFIO0FBQ0FDLFFBQUFBLFNBQVMsQ0FBQ3JDLE9BQU8sQ0FBQ29DLE1BQVQsRUFBaUIsVUFBVUUsR0FBVixFQUFlO0FBQ3ZDLGNBQUlBLEdBQUosRUFBUztBQUNQLGtCQUFNQSxHQUFOO0FBQ0Q7O0FBQ0RiLFVBQUFBLEdBQUcsQ0FBQ1AsR0FBRCxFQUFPLG9CQUFtQmxCLE9BQU8sQ0FBQ29DLE1BQU8sRUFBekMsQ0FBSDtBQUNELFNBTFEsQ0FBVDtBQU1EO0FBQ0Y7QUFDRixHQWxCRCxDQW1CQSxPQUFNTCxDQUFOLEVBQVM7QUFDUCxVQUFNLHVCQUF1QkEsQ0FBQyxDQUFDQyxRQUFGLEVBQTdCO0FBQ0Q7QUFDRixDLENBRUQ7OztBQUNPLFNBQVNPLFlBQVQsQ0FBc0JMLFFBQXRCLEVBQWdDQyxXQUFoQyxFQUE2Q3BDLElBQTdDLEVBQW1EQyxPQUFuRCxFQUE0RDtBQUNqRSxNQUFJO0FBQ0YsUUFBSWtCLEdBQUcsR0FBR25CLElBQUksQ0FBQ21CLEdBQWY7QUFDQSxRQUFJWCxPQUFPLEdBQUdQLE9BQU8sQ0FBQ08sT0FBdEI7QUFDQSxRQUFJTixTQUFTLEdBQUdELE9BQU8sQ0FBQ0MsU0FBeEI7QUFDQW1CLElBQUFBLElBQUksQ0FBQ2IsT0FBRCxFQUFVLHVCQUFWLENBQUo7O0FBRUEsUUFBSU4sU0FBUyxJQUFJLE9BQWpCLEVBQTBCO0FBQ3hCLFVBQUlELE9BQU8sQ0FBQ00sU0FBUixLQUFzQixLQUF0QixJQUErQk4sT0FBTyxDQUFDcUIsV0FBUixLQUF3QixZQUEzRCxFQUF5RTtBQUN2RSxZQUFJbUIsYUFBYSxHQUFHLEVBQXBCLENBRHVFLENBR3ZFOztBQUNBLFlBQUl6QyxJQUFJLENBQUM2QixTQUFMLElBQWtCLFFBQWxCLElBQThCM0IsU0FBUyxLQUFLLFNBQTVDLElBQXlERCxPQUFPLENBQUMyQixZQUFSLElBQXdCLElBQXJGLEVBQTJGO0FBQ3ZGYSxVQUFBQSxhQUFhLEdBQUcxQyxPQUFPLENBQUUsS0FBSUcsU0FBVSxNQUFoQixDQUFQLENBQThCd0MsaUJBQTlCLENBQWdEMUMsSUFBaEQsRUFBc0RDLE9BQXRELENBQWhCO0FBQ0g7O0FBRUQsWUFBSUQsSUFBSSxDQUFDNkIsU0FBTCxJQUFrQixRQUFsQixJQUErQjdCLElBQUksQ0FBQzZCLFNBQUwsSUFBa0IsUUFBbEIsSUFBOEIzQixTQUFTLEtBQUssZ0JBQS9FLEVBQWtHO0FBQ2hHdUMsVUFBQUEsYUFBYSxHQUFHMUMsT0FBTyxDQUFFLEtBQUlHLFNBQVUsTUFBaEIsQ0FBUCxDQUE4QndDLGlCQUE5QixDQUFnRDFDLElBQWhELEVBQXNEQyxPQUF0RCxDQUFoQjtBQUNEOztBQUNEbUMsUUFBQUEsV0FBVyxDQUFDTyxLQUFaLENBQWtCQyxhQUFsQixDQUFnQ0MsR0FBaEMsQ0FBcUMsb0JBQXJDLEVBQTBEQyxNQUFNLElBQUk7QUFDbEUsY0FBSUEsTUFBTSxDQUFDQyxRQUFQLElBQW1CLENBQUNELE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsS0FBaEIsQ0FBc0IsY0FBdEIsQ0FBeEIsRUFBK0Q7QUFDN0QsZ0JBQUk7QUFDQSxrQkFBSUYsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxLQUFoQixDQUFzQixTQUF0QixLQUFvQyxJQUFwQyxJQUNERixNQUFNLENBQUNHLE9BQVAsQ0FBZUMsTUFBZixDQUFzQkMsV0FBdEIsR0FBb0NDLFFBQXBDLENBQTZDLGNBQTdDLEtBQWdFLEtBRG5FLEVBRUU7QUFDRXBELGdCQUFBQSxJQUFJLENBQUNxRCxJQUFMLEdBQVksQ0FDUixJQUFJckQsSUFBSSxDQUFDcUQsSUFBTCxJQUFhLEVBQWpCLENBRFEsRUFFUixHQUFHdEQsT0FBTyxDQUFFLEtBQUlHLFNBQVUsTUFBaEIsQ0FBUCxDQUE4Qm9ELGtCQUE5QixDQUFpRFIsTUFBakQsRUFBeUQ3QyxPQUF6RCxFQUFrRW1DLFdBQWxFLEVBQStFSyxhQUEvRSxDQUZLLENBQVo7QUFHQyxlQU5MLE1BT0s7QUFDRHpDLGdCQUFBQSxJQUFJLENBQUNxRCxJQUFMLEdBQVksQ0FDUixJQUFJckQsSUFBSSxDQUFDcUQsSUFBTCxJQUFhLEVBQWpCLENBRFEsRUFFUixHQUFHdEQsT0FBTyxDQUFFLEtBQUlHLFNBQVUsTUFBaEIsQ0FBUCxDQUE4Qm9ELGtCQUE5QixDQUFpRFIsTUFBakQsRUFBeUQ3QyxPQUF6RCxFQUFrRW1DLFdBQWxFLEVBQStFSyxhQUEvRSxDQUZLLENBQVo7QUFHQztBQUNSLGFBYkQsQ0FjQSxPQUFNVCxDQUFOLEVBQVM7QUFDTHVCLGNBQUFBLE9BQU8sQ0FBQzdCLEdBQVIsQ0FBWU0sQ0FBWjtBQUNIO0FBQ0Y7QUFDRixTQXBCRDtBQXFCRDs7QUFDRCxVQUFJaEMsSUFBSSxDQUFDNkIsU0FBTCxJQUFrQixRQUF0QixFQUFnQztBQUM5Qk8sUUFBQUEsV0FBVyxDQUFDTyxLQUFaLENBQWtCYSxhQUFsQixDQUFnQ1gsR0FBaEMsQ0FBcUMsb0JBQXJDLEVBQTBEWSxPQUFPLElBQUk7QUFDbkUxRCxVQUFBQSxPQUFPLENBQUUsS0FBSUcsU0FBVSxNQUFoQixDQUFQLENBQThCd0QsdUJBQTlCLENBQXNEMUQsSUFBdEQsRUFBNERDLE9BQTVEO0FBQ0QsU0FGRDtBQUdEOztBQUNELFVBQUlELElBQUksQ0FBQzZCLFNBQUwsSUFBa0IsUUFBbEIsSUFBOEI3QixJQUFJLENBQUM2QixTQUFMLElBQWtCLFFBQXBELEVBQThEO0FBQzVELFlBQUk1QixPQUFPLENBQUMwRCxNQUFSLEtBQW1CLEtBQXZCLEVBQThCO0FBQzVCdkIsVUFBQUEsV0FBVyxDQUFDTyxLQUFaLENBQWtCaUIscUNBQWxCLENBQXdEZixHQUF4RCxDQUE2RCxxQkFBN0QsRUFBbUZnQixJQUFELElBQVU7QUFDMUYsa0JBQU1DLElBQUksR0FBRy9ELE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLGdCQUFJZ0UsTUFBTSxHQUFHRCxJQUFJLENBQUNFLElBQUwsQ0FBVWhFLElBQUksQ0FBQ2lFLE9BQWYsRUFBd0IsUUFBeEIsQ0FBYjtBQUNBLGdCQUFJQyxPQUFPLEdBQUdKLElBQUksQ0FBQ0UsSUFBTCxDQUFVaEUsSUFBSSxDQUFDaUUsT0FBZixFQUF3QixTQUF4QixDQUFkLENBSDBGLENBSTFGO0FBQ0E7O0FBQ0FKLFlBQUFBLElBQUksQ0FBQ00sTUFBTCxDQUFZQyxFQUFaLENBQWVDLE9BQWYsQ0FBdUJOLE1BQXZCO0FBQ0FGLFlBQUFBLElBQUksQ0FBQ00sTUFBTCxDQUFZRyxHQUFaLENBQWdCRCxPQUFoQixDQUF3QkgsT0FBeEI7QUFDQXhDLFlBQUFBLEdBQUcsQ0FBQ1AsR0FBRCxFQUFPLFVBQVM0QyxNQUFPLFFBQU9HLE9BQVEsZ0JBQXRDLENBQUg7QUFDRCxXQVREO0FBVUQ7QUFDRjtBQUNGO0FBQ0YsR0E1REQsQ0E2REEsT0FBTWxDLENBQU4sRUFBUztBQUNQLFVBQU0sbUJBQW1CQSxDQUFDLENBQUNDLFFBQUYsRUFBekIsQ0FETyxDQUVYO0FBQ0E7QUFDRztBQUNGLEMsQ0FFRDs7O0FBQ08sU0FBU3NDLGFBQVQsQ0FBdUJwQyxRQUF2QixFQUFpQ0MsV0FBakMsRUFBOENwQyxJQUE5QyxFQUFvREMsT0FBcEQsRUFBNkQ7QUFDbEUsTUFBSTtBQUNGLFFBQUlrQixHQUFHLEdBQUduQixJQUFJLENBQUNtQixHQUFmO0FBQ0EsUUFBSVgsT0FBTyxHQUFHUCxPQUFPLENBQUNPLE9BQXRCO0FBQ0EsUUFBSU4sU0FBUyxHQUFHRCxPQUFPLENBQUNDLFNBQXhCO0FBQ0FtQixJQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBVSx3QkFBVixDQUFKOztBQUNBLFFBQUlOLFNBQVMsSUFBSSxPQUFqQixFQUEwQjtBQUN4QkgsTUFBQUEsT0FBTyxDQUFFLGFBQUYsQ0FBUCxDQUF1QndFLGFBQXZCLENBQXFDbkMsV0FBckMsRUFBa0RwQyxJQUFsRCxFQUF3REMsT0FBeEQ7QUFDRCxLQUZELE1BR0s7QUFDSG9CLE1BQUFBLElBQUksQ0FBQ2IsT0FBRCxFQUFVLGdDQUFWLENBQUo7QUFDRDtBQUNGLEdBWEQsQ0FZQSxPQUFNd0IsQ0FBTixFQUFTO0FBQ1AsVUFBTSxvQkFBb0JBLENBQUMsQ0FBQ0MsUUFBRixFQUExQjtBQUNEO0FBQ0YsQyxDQUVEOzs7U0FDc0J1QyxLOztFQW1FdEI7Ozs7OzswQkFuRU8saUJBQXFCckMsUUFBckIsRUFBK0JDLFdBQS9CLEVBQTRDcEMsSUFBNUMsRUFBa0RDLE9BQWxELEVBQTJEd0UsUUFBM0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRUdYLFVBQUFBLElBRkgsR0FFVS9ELE9BQU8sQ0FBQyxNQUFELENBRmpCO0FBR0NvQixVQUFBQSxHQUhELEdBR09uQixJQUFJLENBQUNtQixHQUhaO0FBSUNYLFVBQUFBLE9BSkQsR0FJV1AsT0FBTyxDQUFDTyxPQUpuQjtBQUtDa0UsVUFBQUEsSUFMRCxHQUtRekUsT0FBTyxDQUFDeUUsSUFMaEI7QUFNQ3hFLFVBQUFBLFNBTkQsR0FNYUQsT0FBTyxDQUFDQyxTQU5yQjtBQU9IbUIsVUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsZ0JBQVQsQ0FBSjs7QUFQRyxnQkFRQ2tFLElBQUksSUFBSSxLQVJUO0FBQUE7QUFBQTtBQUFBOztBQUFBLGdCQVNHMUUsSUFBSSxDQUFDNkIsU0FBTCxJQUFrQixRQUFsQixJQUE4QjdCLElBQUksQ0FBQzZCLFNBQUwsSUFBa0IsUUFUbkQ7QUFBQTtBQUFBO0FBQUE7O0FBVUs4QyxVQUFBQSxVQVZMLEdBVWtCYixJQUFJLENBQUNFLElBQUwsQ0FBVTdCLFFBQVEsQ0FBQ3dDLFVBQW5CLEVBQThCM0UsSUFBSSxDQUFDaUUsT0FBbkMsQ0FWbEI7O0FBV0MsY0FBSTlCLFFBQVEsQ0FBQ3dDLFVBQVQsS0FBd0IsR0FBeEIsSUFBK0J4QyxRQUFRLENBQUNsQyxPQUFULENBQWlCMkUsU0FBcEQsRUFBK0Q7QUFDN0RELFlBQUFBLFVBQVUsR0FBR2IsSUFBSSxDQUFDRSxJQUFMLENBQVU3QixRQUFRLENBQUNsQyxPQUFULENBQWlCMkUsU0FBakIsQ0FBMkJDLFdBQXJDLEVBQWtERixVQUFsRCxDQUFiO0FBQ0Q7O0FBQ0R0RCxVQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBUyxpQkFBaUJtRSxVQUExQixDQUFKO0FBQ0F0RCxVQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBUyxnQkFBZ0JOLFNBQXpCLENBQUo7O0FBQ0EsY0FBSUEsU0FBUyxJQUFJLE9BQWpCLEVBQTBCO0FBQ3hCNEUsWUFBQUEsZ0JBQWdCLENBQUMzRCxHQUFELEVBQU1uQixJQUFOLEVBQVlDLE9BQVosRUFBcUIwRSxVQUFyQixFQUFpQ3ZDLFdBQWpDLENBQWhCO0FBQ0Q7O0FBQ0cyQyxVQUFBQSxPQW5CTCxHQW1CZSxFQW5CZjs7QUFvQkMsY0FBSTlFLE9BQU8sQ0FBQ3dCLEtBQVIsSUFBaUIsS0FBakIsSUFBMEJ6QixJQUFJLENBQUN1QixVQUFMLElBQW1CLEtBQWpELEVBQ0U7QUFBQ3dELFlBQUFBLE9BQU8sR0FBRyxPQUFWO0FBQWtCLFdBRHJCLE1BR0U7QUFBQ0EsWUFBQUEsT0FBTyxHQUFHLE9BQVY7QUFBa0I7O0FBdkJ0QixnQkF3QksvRSxJQUFJLENBQUNnRixPQUFMLElBQWdCLElBeEJyQjtBQUFBO0FBQUE7QUFBQTs7QUF5Qk9DLFVBQUFBLEtBekJQLEdBeUJlLEVBekJmOztBQTBCRyxjQUFJaEYsT0FBTyxDQUFDaUYsT0FBUixJQUFtQi9FLFNBQW5CLElBQWdDRixPQUFPLENBQUNpRixPQUFSLElBQW1CLEVBQW5ELElBQXlEakYsT0FBTyxDQUFDaUYsT0FBUixJQUFtQixJQUFoRixFQUFzRjtBQUNwRixnQkFBSUgsT0FBTyxJQUFJLE9BQWYsRUFDRTtBQUFFRSxjQUFBQSxLQUFLLEdBQUcsQ0FBQyxLQUFELEVBQVFGLE9BQVIsRUFBaUI5RSxPQUFPLENBQUNxQixXQUF6QixDQUFSO0FBQStDLGFBRG5ELE1BR0U7QUFBRTJELGNBQUFBLEtBQUssR0FBRyxDQUFDLEtBQUQsRUFBUUYsT0FBUixFQUFpQixjQUFqQixFQUFpQyxPQUFqQyxFQUEwQzlFLE9BQU8sQ0FBQ3FCLFdBQWxELENBQVI7QUFBd0U7QUFDN0UsV0FMRCxNQU1LO0FBQ0gsZ0JBQUl5RCxPQUFPLElBQUksT0FBZixFQUNFO0FBQUNFLGNBQUFBLEtBQUssR0FBRyxDQUFDLEtBQUQsRUFBUUYsT0FBUixFQUFpQjlFLE9BQU8sQ0FBQ2lGLE9BQXpCLEVBQWtDakYsT0FBTyxDQUFDcUIsV0FBMUMsQ0FBUjtBQUErRCxhQURsRSxNQUdFO0FBQUMyRCxjQUFBQSxLQUFLLEdBQUcsQ0FBQyxLQUFELEVBQVFGLE9BQVIsRUFBaUIsY0FBakIsRUFBaUMsT0FBakMsRUFBMEM5RSxPQUFPLENBQUNpRixPQUFsRCxFQUEyRGpGLE9BQU8sQ0FBQ3FCLFdBQW5FLENBQVI7QUFBd0Y7QUFDNUY7O0FBckNKLGdCQXNDT3RCLElBQUksQ0FBQ21GLFlBQUwsSUFBcUIsS0F0QzVCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsaUJBdUNXQyxlQUFlLENBQUNqRSxHQUFELEVBQU1pQixXQUFOLEVBQW1CdUMsVUFBbkIsRUFBK0JNLEtBQS9CLEVBQXNDakYsSUFBdEMsRUFBNENDLE9BQTVDLENBdkMxQjs7QUFBQTtBQXdDS0QsVUFBQUEsSUFBSSxDQUFDbUYsWUFBTCxHQUFvQixJQUFwQjs7QUF4Q0w7QUEwQ0dWLFVBQUFBLFFBQVE7QUExQ1g7QUFBQTs7QUFBQTtBQTZDR0EsVUFBQUEsUUFBUTs7QUE3Q1g7QUFBQTtBQUFBOztBQUFBO0FBaURDcEQsVUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsa0JBQVQsQ0FBSjtBQUNBaUUsVUFBQUEsUUFBUTs7QUFsRFQ7QUFBQTtBQUFBOztBQUFBO0FBc0REcEQsVUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsWUFBVCxDQUFKO0FBQ0FpRSxVQUFBQSxRQUFROztBQXZEUDtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBMkRIQSxVQUFBQSxRQUFRO0FBM0RMLGdCQTRERyxZQUFZLFlBQUV4QyxRQUFGLEVBNURmOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHOzs7O0FBb0VBLFNBQVNvRCxLQUFULENBQWVDLEtBQWYsRUFBc0J0RixJQUF0QixFQUE0QkMsT0FBNUIsRUFBcUM7QUFDMUMsTUFBSTtBQUNGLFFBQUlPLE9BQU8sR0FBR1AsT0FBTyxDQUFDTyxPQUF0QjtBQUNBLFFBQUlOLFNBQVMsR0FBR0QsT0FBTyxDQUFDQyxTQUF4QjtBQUNBbUIsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsZ0JBQVQsQ0FBSjs7QUFDQSxRQUFJOEUsS0FBSyxDQUFDbEQsV0FBTixDQUFrQm1ELE1BQWxCLElBQTRCRCxLQUFLLENBQUNsRCxXQUFOLENBQWtCbUQsTUFBbEIsQ0FBeUJDLE1BQXpELEVBQWlFO0FBQ2pFO0FBQ0UsWUFBSUMsS0FBSyxHQUFHMUYsT0FBTyxDQUFDLE9BQUQsQ0FBbkI7O0FBQ0F3RCxRQUFBQSxPQUFPLENBQUM3QixHQUFSLENBQVkrRCxLQUFLLENBQUNDLEdBQU4sQ0FBVSw0Q0FBVixDQUFaO0FBQ0FuQyxRQUFBQSxPQUFPLENBQUM3QixHQUFSLENBQVk0RCxLQUFLLENBQUNsRCxXQUFOLENBQWtCbUQsTUFBbEIsQ0FBeUIsQ0FBekIsQ0FBWjtBQUNBaEMsUUFBQUEsT0FBTyxDQUFDN0IsR0FBUixDQUFZK0QsS0FBSyxDQUFDQyxHQUFOLENBQVUsNENBQVYsQ0FBWjtBQUNBQyxRQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxDQUFiO0FBQ0QsT0FYQyxDQWFGOzs7QUFDQSxRQUFJNUYsSUFBSSxDQUFDdUIsVUFBTCxJQUFtQixJQUFuQixJQUEyQnRCLE9BQU8sQ0FBQ00sU0FBUixJQUFxQixJQUFoRCxJQUF3REwsU0FBUyxJQUFJLFNBQXpFLEVBQW9GO0FBQ2xGSCxNQUFBQSxPQUFPLENBQUUsS0FBSUUsT0FBTyxDQUFDQyxTQUFVLE1BQXhCLENBQVAsQ0FBc0MyRixNQUF0QyxDQUE2QzdGLElBQTdDLEVBQW1EQyxPQUFuRDtBQUNEOztBQUNELFFBQUk7QUFDRixVQUFHQSxPQUFPLENBQUN1QixPQUFSLElBQW1CLEtBQW5CLElBQTRCdkIsT0FBTyxDQUFDd0IsS0FBUixJQUFpQixLQUE3QyxJQUFzRHpCLElBQUksQ0FBQ3VCLFVBQUwsSUFBbUIsS0FBNUUsRUFBbUY7QUFDakYsWUFBSXZCLElBQUksQ0FBQzhGLFlBQUwsSUFBcUIsQ0FBekIsRUFBNEI7QUFDMUIsY0FBSUMsR0FBRyxHQUFHLHNCQUFzQjlGLE9BQU8sQ0FBQytGLElBQXhDOztBQUNBakcsVUFBQUEsT0FBTyxDQUFDLGNBQUQsQ0FBUCxDQUF3QjJCLEdBQXhCLENBQTRCMUIsSUFBSSxDQUFDbUIsR0FBakMsRUFBdUMsc0JBQXFCNEUsR0FBSSxFQUFoRTs7QUFDQS9GLFVBQUFBLElBQUksQ0FBQzhGLFlBQUw7O0FBQ0EsZ0JBQU1HLEdBQUcsR0FBR2xHLE9BQU8sQ0FBQyxLQUFELENBQW5COztBQUNBa0csVUFBQUEsR0FBRyxDQUFDRixHQUFELENBQUg7QUFDRDtBQUNGO0FBQ0YsS0FWRCxDQVdBLE9BQU8vRCxDQUFQLEVBQVU7QUFDUnVCLE1BQUFBLE9BQU8sQ0FBQzdCLEdBQVIsQ0FBWU0sQ0FBWjtBQUNEOztBQUNELFFBQUloQyxJQUFJLENBQUM2QixTQUFMLElBQWtCLFFBQXRCLEVBQWdDO0FBQzlCLFVBQUk3QixJQUFJLENBQUN1QixVQUFMLElBQW1CLElBQXZCLEVBQTZCO0FBQzNCeEIsUUFBQUEsT0FBTyxDQUFDLGNBQUQsQ0FBUCxDQUF3QjJCLEdBQXhCLENBQTRCMUIsSUFBSSxDQUFDbUIsR0FBakMsRUFBdUMsK0JBQThCakIsU0FBVSxFQUEvRTtBQUNELE9BRkQsTUFHSztBQUNISCxRQUFBQSxPQUFPLENBQUMsY0FBRCxDQUFQLENBQXdCMkIsR0FBeEIsQ0FBNEIxQixJQUFJLENBQUNtQixHQUFqQyxFQUF1QyxnQ0FBK0JqQixTQUFVLEVBQWhGO0FBQ0Q7QUFDRjs7QUFDRCxRQUFJRixJQUFJLENBQUM2QixTQUFMLElBQWtCLFFBQXRCLEVBQWdDO0FBQzlCOUIsTUFBQUEsT0FBTyxDQUFDLGNBQUQsQ0FBUCxDQUF3QjJCLEdBQXhCLENBQTRCMUIsSUFBSSxDQUFDbUIsR0FBakMsRUFBdUMsK0JBQThCakIsU0FBVSxFQUEvRTtBQUNEO0FBQ0YsR0ExQ0QsQ0EyQ0EsT0FBTThCLENBQU4sRUFBUztBQUNYO0FBQ0ksVUFBTSxZQUFZQSxDQUFDLENBQUNDLFFBQUYsRUFBbEI7QUFDRDtBQUNGLEMsQ0FFRDs7O0FBQ08sU0FBUzZDLGdCQUFULENBQTBCM0QsR0FBMUIsRUFBK0JuQixJQUEvQixFQUFxQ0MsT0FBckMsRUFBOENpRyxNQUE5QyxFQUFzRDlELFdBQXRELEVBQW1FO0FBQ3hFLE1BQUk7QUFDRixRQUFJNUIsT0FBTyxHQUFHUCxPQUFPLENBQUNPLE9BQXRCO0FBQ0EsUUFBSTJGLFFBQVEsR0FBR2xHLE9BQU8sQ0FBQ2tHLFFBQXZCO0FBQ0EsUUFBSUMsT0FBTyxHQUFHbkcsT0FBTyxDQUFDbUcsT0FBdEI7QUFDQSxRQUFJQyxLQUFLLEdBQUdwRyxPQUFPLENBQUNvRyxLQUFwQjtBQUNBaEYsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsMkJBQVQsQ0FBSjs7QUFDQSxVQUFNOEYsTUFBTSxHQUFHdkcsT0FBTyxDQUFDLFFBQUQsQ0FBdEI7O0FBQ0EsVUFBTXdHLE1BQU0sR0FBR3hHLE9BQU8sQ0FBQyxRQUFELENBQXRCOztBQUNBLFVBQU15RyxHQUFHLEdBQUd6RyxPQUFPLENBQUMsVUFBRCxDQUFuQjs7QUFDQSxVQUFNRCxFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLFVBQU0rRCxJQUFJLEdBQUcvRCxPQUFPLENBQUMsTUFBRCxDQUFwQjs7QUFDQXNHLElBQUFBLEtBQUssR0FBR0EsS0FBSyxLQUFLRCxPQUFPLEtBQUssU0FBWixHQUF3QixjQUF4QixHQUF5QyxnQkFBOUMsQ0FBYjtBQUNBL0UsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsZ0JBQWdCUixJQUFJLENBQUN5RyxTQUE5QixDQUFKOztBQUNBLFFBQUl6RyxJQUFJLENBQUN5RyxTQUFULEVBQW9CO0FBQ2xCSCxNQUFBQSxNQUFNLENBQUNJLElBQVAsQ0FBWVIsTUFBWjtBQUNBSyxNQUFBQSxNQUFNLENBQUNHLElBQVAsQ0FBWVIsTUFBWjs7QUFDQSxZQUFNUyxRQUFRLEdBQUc1RyxPQUFPLENBQUMsYUFBRCxDQUFQLENBQXVCNEcsUUFBeEM7O0FBQ0EsWUFBTUMsYUFBYSxHQUFHN0csT0FBTyxDQUFDLGFBQUQsQ0FBUCxDQUF1QjZHLGFBQTdDOztBQUNBLFlBQU1DLG1CQUFtQixHQUFHOUcsT0FBTyxDQUFDLGFBQUQsQ0FBUCxDQUF1QjhHLG1CQUFuRDs7QUFDQSxZQUFNQyxzQkFBc0IsR0FBRy9HLE9BQU8sQ0FBQyxhQUFELENBQVAsQ0FBdUIrRyxzQkFBdEQ7O0FBQ0FoSCxNQUFBQSxFQUFFLENBQUNpSCxhQUFILENBQWlCakQsSUFBSSxDQUFDRSxJQUFMLENBQVVrQyxNQUFWLEVBQWtCLFdBQWxCLENBQWpCLEVBQWlEUyxRQUFRLENBQUMzRyxJQUFJLENBQUN1QixVQUFOLEVBQWtCdEIsT0FBbEIsRUFBMkJpRyxNQUEzQixDQUF6RCxFQUE2RixNQUE3RjtBQUNBcEcsTUFBQUEsRUFBRSxDQUFDaUgsYUFBSCxDQUFpQmpELElBQUksQ0FBQ0UsSUFBTCxDQUFVa0MsTUFBVixFQUFrQixVQUFsQixDQUFqQixFQUFnRFUsYUFBYSxDQUFDUCxLQUFELEVBQVFGLFFBQVIsRUFBa0JDLE9BQWxCLEVBQTJCbkcsT0FBM0IsRUFBb0NpRyxNQUFwQyxDQUE3RCxFQUEwRyxNQUExRztBQUNBcEcsTUFBQUEsRUFBRSxDQUFDaUgsYUFBSCxDQUFpQmpELElBQUksQ0FBQ0UsSUFBTCxDQUFVa0MsTUFBVixFQUFrQixzQkFBbEIsQ0FBakIsRUFBNERZLHNCQUFzQixDQUFDN0csT0FBRCxFQUFVaUcsTUFBVixDQUFsRixFQUFxRyxNQUFyRztBQUNBcEcsTUFBQUEsRUFBRSxDQUFDaUgsYUFBSCxDQUFpQmpELElBQUksQ0FBQ0UsSUFBTCxDQUFVa0MsTUFBVixFQUFrQixnQkFBbEIsQ0FBakIsRUFBc0RXLG1CQUFtQixDQUFDNUcsT0FBRCxFQUFVaUcsTUFBVixDQUF6RSxFQUE0RixNQUE1RjtBQUNBLFVBQUloRyxTQUFTLEdBQUdGLElBQUksQ0FBQ0UsU0FBckIsQ0FYa0IsQ0FZbEI7O0FBQ0EsVUFBSUosRUFBRSxDQUFDYyxVQUFILENBQWNrRCxJQUFJLENBQUNFLElBQUwsQ0FBVTJCLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBVixFQUF5QixPQUFNOUcsU0FBVSxNQUF6QyxDQUFkLENBQUosRUFBb0U7QUFDbEUsWUFBSStHLFFBQVEsR0FBR25ELElBQUksQ0FBQ0UsSUFBTCxDQUFVMkIsT0FBTyxDQUFDcUIsR0FBUixFQUFWLEVBQTBCLE9BQU05RyxTQUFVLE1BQTFDLENBQWY7QUFDQSxZQUFJZ0gsTUFBTSxHQUFHcEQsSUFBSSxDQUFDRSxJQUFMLENBQVVrQyxNQUFWLEVBQWtCLElBQWxCLENBQWI7QUFDQU0sUUFBQUEsR0FBRyxDQUFDVyxRQUFKLENBQWFGLFFBQWIsRUFBdUJDLE1BQXZCO0FBQ0F4RixRQUFBQSxHQUFHLENBQUNQLEdBQUQsRUFBTSxrQkFBa0I4RixRQUFRLENBQUNHLE9BQVQsQ0FBaUJ6QixPQUFPLENBQUNxQixHQUFSLEVBQWpCLEVBQWdDLEVBQWhDLENBQWxCLEdBQXdELE9BQXhELEdBQWtFRSxNQUFNLENBQUNFLE9BQVAsQ0FBZXpCLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBZixFQUE4QixFQUE5QixDQUF4RSxDQUFIO0FBQ0Q7O0FBQ0QsVUFBSWxILEVBQUUsQ0FBQ2MsVUFBSCxDQUFja0QsSUFBSSxDQUFDRSxJQUFMLENBQVUyQixPQUFPLENBQUNxQixHQUFSLEVBQVYsRUFBeUIsT0FBTTlHLFNBQVUsWUFBekMsQ0FBZCxDQUFKLEVBQTBFO0FBQ3hFLFlBQUkrRyxRQUFRLEdBQUduRCxJQUFJLENBQUNFLElBQUwsQ0FBVTJCLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBVixFQUEwQixPQUFNOUcsU0FBVSxZQUExQyxDQUFmO0FBQ0EsWUFBSWdILE1BQU0sR0FBR3BELElBQUksQ0FBQ0UsSUFBTCxDQUFVa0MsTUFBVixFQUFrQixVQUFsQixDQUFiO0FBQ0FNLFFBQUFBLEdBQUcsQ0FBQ1csUUFBSixDQUFhRixRQUFiLEVBQXVCQyxNQUF2QjtBQUNBeEYsUUFBQUEsR0FBRyxDQUFDUCxHQUFELEVBQU0sYUFBYThGLFFBQVEsQ0FBQ0csT0FBVCxDQUFpQnpCLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBakIsRUFBZ0MsRUFBaEMsQ0FBYixHQUFtRCxPQUFuRCxHQUE2REUsTUFBTSxDQUFDRSxPQUFQLENBQWV6QixPQUFPLENBQUNxQixHQUFSLEVBQWYsRUFBOEIsRUFBOUIsQ0FBbkUsQ0FBSDtBQUNEOztBQUNELFVBQUlsSCxFQUFFLENBQUNjLFVBQUgsQ0FBY2tELElBQUksQ0FBQ0UsSUFBTCxDQUFVMkIsT0FBTyxDQUFDcUIsR0FBUixFQUFWLEVBQXlCLE9BQU05RyxTQUFVLGFBQXpDLENBQWQsQ0FBSixFQUEyRTtBQUN6RSxZQUFJK0csUUFBUSxHQUFHbkQsSUFBSSxDQUFDRSxJQUFMLENBQVUyQixPQUFPLENBQUNxQixHQUFSLEVBQVYsRUFBMEIsT0FBTTlHLFNBQVUsYUFBMUMsQ0FBZjtBQUNBLFlBQUlnSCxNQUFNLEdBQUdwRCxJQUFJLENBQUNFLElBQUwsQ0FBVWtDLE1BQVYsRUFBa0IsV0FBbEIsQ0FBYjtBQUNBTSxRQUFBQSxHQUFHLENBQUNXLFFBQUosQ0FBYUYsUUFBYixFQUF1QkMsTUFBdkI7QUFDQXhGLFFBQUFBLEdBQUcsQ0FBQ1AsR0FBRCxFQUFNLGFBQWE4RixRQUFRLENBQUNHLE9BQVQsQ0FBaUJ6QixPQUFPLENBQUNxQixHQUFSLEVBQWpCLEVBQWdDLEVBQWhDLENBQWIsR0FBbUQsT0FBbkQsR0FBNkRFLE1BQU0sQ0FBQ0UsT0FBUCxDQUFlekIsT0FBTyxDQUFDcUIsR0FBUixFQUFmLEVBQThCLEVBQTlCLENBQW5FLENBQUg7QUFDRDs7QUFDRCxVQUFJbEgsRUFBRSxDQUFDYyxVQUFILENBQWNrRCxJQUFJLENBQUNFLElBQUwsQ0FBVTJCLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBVixFQUF3QixZQUF4QixDQUFkLENBQUosRUFBMEQ7QUFDeEQsWUFBSUssYUFBYSxHQUFHdkQsSUFBSSxDQUFDRSxJQUFMLENBQVUyQixPQUFPLENBQUNxQixHQUFSLEVBQVYsRUFBeUIsWUFBekIsQ0FBcEI7QUFDQSxZQUFJTSxXQUFXLEdBQUd4RCxJQUFJLENBQUNFLElBQUwsQ0FBVWtDLE1BQVYsRUFBa0IsY0FBbEIsQ0FBbEI7QUFDQU0sUUFBQUEsR0FBRyxDQUFDVyxRQUFKLENBQWFFLGFBQWIsRUFBNEJDLFdBQTVCO0FBQ0E1RixRQUFBQSxHQUFHLENBQUNQLEdBQUQsRUFBTSxhQUFha0csYUFBYSxDQUFDRCxPQUFkLENBQXNCekIsT0FBTyxDQUFDcUIsR0FBUixFQUF0QixFQUFxQyxFQUFyQyxDQUFiLEdBQXdELE9BQXhELEdBQWtFTSxXQUFXLENBQUNGLE9BQVosQ0FBb0J6QixPQUFPLENBQUNxQixHQUFSLEVBQXBCLEVBQW1DLEVBQW5DLENBQXhFLENBQUg7QUFDRDtBQUNGOztBQUNEaEgsSUFBQUEsSUFBSSxDQUFDeUcsU0FBTCxHQUFpQixLQUFqQjtBQUNBLFFBQUlyQyxFQUFFLEdBQUcsRUFBVDs7QUFDQSxRQUFJcEUsSUFBSSxDQUFDdUIsVUFBVCxFQUFxQjtBQUNuQnZCLE1BQUFBLElBQUksQ0FBQ3FELElBQUwsR0FBWXJELElBQUksQ0FBQ3FELElBQUwsQ0FBVWtFLE1BQVYsQ0FBaUIsVUFBU0MsS0FBVCxFQUFnQkMsS0FBaEIsRUFBc0I7QUFBRSxlQUFPekgsSUFBSSxDQUFDcUQsSUFBTCxDQUFVcUUsT0FBVixDQUFrQkYsS0FBbEIsS0FBNEJDLEtBQW5DO0FBQTBDLE9BQW5GLENBQVo7QUFDQXJELE1BQUFBLEVBQUUsR0FBR3BFLElBQUksQ0FBQ3FELElBQUwsQ0FBVVcsSUFBVixDQUFlLEtBQWYsQ0FBTDtBQUNELEtBSEQsTUFJSztBQUNISSxNQUFBQSxFQUFFLEdBQUksNkNBQU47QUFDRDs7QUFDRCxRQUFJcEUsSUFBSSxDQUFDMkgsUUFBTCxLQUFrQixJQUFsQixJQUEwQnZELEVBQUUsS0FBS3BFLElBQUksQ0FBQzJILFFBQTFDLEVBQW9EO0FBQ2xEM0gsTUFBQUEsSUFBSSxDQUFDMkgsUUFBTCxHQUFnQnZELEVBQUUsR0FBRyxxQ0FBckI7QUFDQSxZQUFNdUQsUUFBUSxHQUFHN0QsSUFBSSxDQUFDRSxJQUFMLENBQVVrQyxNQUFWLEVBQWtCLGFBQWxCLENBQWpCO0FBQ0FwRyxNQUFBQSxFQUFFLENBQUNpSCxhQUFILENBQWlCWSxRQUFqQixFQUEyQjNILElBQUksQ0FBQzJILFFBQWhDLEVBQTBDLE1BQTFDO0FBQ0EzSCxNQUFBQSxJQUFJLENBQUNnRixPQUFMLEdBQWUsSUFBZjtBQUNBLFVBQUk0QyxTQUFTLEdBQUcxQixNQUFNLENBQUNrQixPQUFQLENBQWV6QixPQUFPLENBQUNxQixHQUFSLEVBQWYsRUFBOEIsRUFBOUIsQ0FBaEI7O0FBQ0EsVUFBSVksU0FBUyxDQUFDQyxJQUFWLE1BQW9CLEVBQXhCLEVBQTRCO0FBQUNELFFBQUFBLFNBQVMsR0FBRyxJQUFaO0FBQWlCOztBQUM5Q2xHLE1BQUFBLEdBQUcsQ0FBQ1AsR0FBRCxFQUFNLDZCQUE2QnlHLFNBQW5DLENBQUg7QUFDRCxLQVJELE1BU0s7QUFDSDVILE1BQUFBLElBQUksQ0FBQ2dGLE9BQUwsR0FBZSxLQUFmO0FBQ0F0RCxNQUFBQSxHQUFHLENBQUNQLEdBQUQsRUFBTSx3QkFBTixDQUFIO0FBQ0Q7QUFDRixHQXpFRCxDQTBFQSxPQUFNYSxDQUFOLEVBQVM7QUFDUGpDLElBQUFBLE9BQU8sQ0FBQyxjQUFELENBQVAsQ0FBd0JzQixJQUF4QixDQUE2QnBCLE9BQU8sQ0FBQ08sT0FBckMsRUFBNkN3QixDQUE3Qzs7QUFDQUksSUFBQUEsV0FBVyxDQUFDbUQsTUFBWixDQUFtQmxGLElBQW5CLENBQXdCLHVCQUF1QjJCLENBQS9DO0FBQ0Q7QUFDRixDLENBRUQ7OztBQUNPLFNBQVNvRCxlQUFULENBQXlCakUsR0FBekIsRUFBOEJpQixXQUE5QixFQUEyQ3VDLFVBQTNDLEVBQXVETSxLQUF2RCxFQUE4RGpGLElBQTlELEVBQW9FQyxPQUFwRSxFQUE2RTtBQUNwRjtBQUNJLE1BQUlPLE9BQU8sR0FBR1AsT0FBTyxDQUFDTyxPQUF0Qjs7QUFDQSxRQUFNVixFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBc0IsRUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsMEJBQVQsQ0FBSjtBQUNBLE1BQUlzSCxNQUFKOztBQUFZLE1BQUk7QUFBRUEsSUFBQUEsTUFBTSxHQUFHL0gsT0FBTyxDQUFDLGFBQUQsQ0FBaEI7QUFBaUMsR0FBdkMsQ0FBd0MsT0FBT2lDLENBQVAsRUFBVTtBQUFFOEYsSUFBQUEsTUFBTSxHQUFHLFFBQVQ7QUFBbUI7O0FBQ25GLE1BQUloSSxFQUFFLENBQUNjLFVBQUgsQ0FBY2tILE1BQWQsQ0FBSixFQUEyQjtBQUN6QnpHLElBQUFBLElBQUksQ0FBQ2IsT0FBRCxFQUFTLHNCQUFULENBQUo7QUFDRCxHQUZELE1BR0s7QUFDSGEsSUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVMsOEJBQVQsQ0FBSjtBQUNEOztBQUNELFNBQU8sSUFBSXVILE9BQUosQ0FBWSxDQUFDQyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDdEMsVUFBTUMsV0FBVyxHQUFHLE1BQU07QUFDeEI3RyxNQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBUyxhQUFULENBQUo7QUFDQXdILE1BQUFBLE9BQU87QUFDUixLQUhEOztBQUlBLFFBQUlHLElBQUksR0FBRztBQUFFbkIsTUFBQUEsR0FBRyxFQUFFckMsVUFBUDtBQUFtQnlELE1BQUFBLE1BQU0sRUFBRSxJQUEzQjtBQUFpQ0MsTUFBQUEsS0FBSyxFQUFFLE1BQXhDO0FBQWdEQyxNQUFBQSxRQUFRLEVBQUU7QUFBMUQsS0FBWDs7QUFDQUMsSUFBQUEsYUFBYSxDQUFDcEgsR0FBRCxFQUFNMkcsTUFBTixFQUFjN0MsS0FBZCxFQUFxQmtELElBQXJCLEVBQTJCL0YsV0FBM0IsRUFBd0NwQyxJQUF4QyxFQUE4Q0MsT0FBOUMsQ0FBYixDQUFvRXVJLElBQXBFLENBQ0UsWUFBVztBQUFFTixNQUFBQSxXQUFXO0FBQUksS0FEOUIsRUFFRSxVQUFTTyxNQUFULEVBQWlCO0FBQUVSLE1BQUFBLE1BQU0sQ0FBQ1EsTUFBRCxDQUFOO0FBQWdCLEtBRnJDO0FBSUQsR0FWTSxDQUFQLENBWmdGLENBdUJsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNELEMsQ0FFRDs7O1NBQ3NCRixhOztFQTJFdEI7Ozs7OzswQkEzRU8sa0JBQThCcEgsR0FBOUIsRUFBbUM0RCxPQUFuQyxFQUE0Q0UsS0FBNUMsRUFBbURrRCxJQUFuRCxFQUF5RC9GLFdBQXpELEVBQXNFcEMsSUFBdEUsRUFBNEVDLE9BQTVFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUDtBQUNRTyxVQUFBQSxPQUZELEdBRVdQLE9BQU8sQ0FBQ08sT0FGbkI7QUFHQ04sVUFBQUEsU0FIRCxHQUdhRCxPQUFPLENBQUNDLFNBSHJCLEVBSUg7O0FBQ013SSxVQUFBQSxlQUxILEdBS3FCLENBQUMsZUFBRCxFQUFrQixlQUFsQixFQUFtQyxjQUFuQyxFQUFtRCxrQkFBbkQsRUFBdUUsd0JBQXZFLEVBQWlHLDhCQUFqRyxFQUFpSSxPQUFqSSxFQUEwSSxPQUExSSxFQUFtSixlQUFuSixFQUFvSyxxQkFBcEssRUFBMkwsZUFBM0wsRUFBNE0sdUJBQTVNLENBTHJCO0FBTUNDLFVBQUFBLFVBTkQsR0FNY0QsZUFOZDtBQU9DakQsVUFBQUEsS0FQRCxHQU9TMUYsT0FBTyxDQUFDLE9BQUQsQ0FQaEI7QUFRRzZJLFVBQUFBLFVBUkgsR0FRZ0I3SSxPQUFPLENBQUMsYUFBRCxDQVJ2QjtBQVNIc0IsVUFBQUEsSUFBSSxDQUFDYixPQUFELEVBQVUsd0JBQVYsQ0FBSjtBQVRHO0FBQUEsaUJBVUcsSUFBSXVILE9BQUosQ0FBWSxDQUFDQyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDckM1RyxZQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBVSxhQUFZdUUsT0FBUSxFQUE5QixDQUFKO0FBQ0ExRCxZQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBVyxXQUFVeUUsS0FBTSxFQUEzQixDQUFKO0FBQ0E1RCxZQUFBQSxJQUFJLENBQUNiLE9BQUQsRUFBVyxVQUFTSyxJQUFJLENBQUNnSSxTQUFMLENBQWVWLElBQWYsQ0FBcUIsRUFBekMsQ0FBSjtBQUNBLGdCQUFJVyxLQUFLLEdBQUdGLFVBQVUsQ0FBQzdELE9BQUQsRUFBVUUsS0FBVixFQUFpQmtELElBQWpCLENBQXRCO0FBQ0FXLFlBQUFBLEtBQUssQ0FBQ0MsRUFBTixDQUFTLE9BQVQsRUFBa0IsQ0FBQ0MsSUFBRCxFQUFPQyxNQUFQLEtBQWtCO0FBQ2xDNUgsY0FBQUEsSUFBSSxDQUFDYixPQUFELEVBQVcsWUFBRCxHQUFld0ksSUFBekIsQ0FBSjs7QUFDQSxrQkFBR0EsSUFBSSxLQUFLLENBQVosRUFBZTtBQUFFaEIsZ0JBQUFBLE9BQU8sQ0FBQyxDQUFELENBQVA7QUFBWSxlQUE3QixNQUNLO0FBQUU1RixnQkFBQUEsV0FBVyxDQUFDbUQsTUFBWixDQUFtQmxGLElBQW5CLENBQXlCLElBQUk2SSxLQUFKLENBQVVGLElBQVYsQ0FBekI7QUFBNENoQixnQkFBQUEsT0FBTyxDQUFDLENBQUQsQ0FBUDtBQUFZO0FBQ2hFLGFBSkQ7QUFLQWMsWUFBQUEsS0FBSyxDQUFDQyxFQUFOLENBQVMsT0FBVCxFQUFtQkksS0FBRCxJQUFXO0FBQzNCOUgsY0FBQUEsSUFBSSxDQUFDYixPQUFELEVBQVcsVUFBWCxDQUFKO0FBQ0E0QixjQUFBQSxXQUFXLENBQUNtRCxNQUFaLENBQW1CbEYsSUFBbkIsQ0FBd0I4SSxLQUF4QjtBQUNBbkIsY0FBQUEsT0FBTyxDQUFDLENBQUQsQ0FBUDtBQUNELGFBSkQ7QUFLQWMsWUFBQUEsS0FBSyxDQUFDTSxNQUFOLENBQWFMLEVBQWIsQ0FBZ0IsTUFBaEIsRUFBeUJsRixJQUFELElBQVU7QUFDaEMsa0JBQUl3RixHQUFHLEdBQUd4RixJQUFJLENBQUM1QixRQUFMLEdBQWdCbUYsT0FBaEIsQ0FBd0IsV0FBeEIsRUFBcUMsR0FBckMsRUFBMENTLElBQTFDLEVBQVY7QUFDQXhHLGNBQUFBLElBQUksQ0FBQ2IsT0FBRCxFQUFXLEdBQUU2SSxHQUFJLEVBQWpCLENBQUo7O0FBQ0Esa0JBQUl4RixJQUFJLElBQUlBLElBQUksQ0FBQzVCLFFBQUwsR0FBZ0JlLEtBQWhCLENBQXNCLG1DQUF0QixDQUFaLEVBQXdFO0FBRXRFLHNCQUFNbEQsRUFBRSxHQUFHQyxPQUFPLENBQUMsSUFBRCxDQUFsQjs7QUFDQSxvQkFBSXVKLFFBQVEsR0FBRzNELE9BQU8sQ0FBQ3FCLEdBQVIsS0FBZ0JoSCxJQUFJLENBQUN1SixTQUFwQzs7QUFDQSxvQkFBSTtBQUNGLHNCQUFJQyxDQUFDLEdBQUcsSUFBSUMsSUFBSixHQUFXQyxjQUFYLEVBQVI7QUFDQSxzQkFBSTdGLElBQUksR0FBRy9ELEVBQUUsQ0FBQ2lCLFlBQUgsQ0FBZ0J1SSxRQUFoQixDQUFYO0FBQ0F4SixrQkFBQUEsRUFBRSxDQUFDaUgsYUFBSCxDQUFpQnVDLFFBQWpCLEVBQTJCLE9BQU9FLENBQWxDLEVBQXFDLE1BQXJDO0FBQ0FuSSxrQkFBQUEsSUFBSSxDQUFDRixHQUFELEVBQU8sWUFBV21JLFFBQVMsRUFBM0IsQ0FBSjtBQUNELGlCQUxELENBTUEsT0FBTXRILENBQU4sRUFBUztBQUNQWCxrQkFBQUEsSUFBSSxDQUFDRixHQUFELEVBQU8sZ0JBQWVtSSxRQUFTLEVBQS9CLENBQUo7QUFDRDs7QUFFRHRCLGdCQUFBQSxPQUFPLENBQUMsQ0FBRCxDQUFQO0FBQ0QsZUFmRCxNQWdCSztBQUNILG9CQUFJVyxVQUFVLENBQUNnQixJQUFYLENBQWdCLFVBQVNDLENBQVQsRUFBWTtBQUFFLHlCQUFPL0YsSUFBSSxDQUFDNkQsT0FBTCxDQUFha0MsQ0FBYixLQUFtQixDQUExQjtBQUE4QixpQkFBNUQsQ0FBSixFQUFtRTtBQUNqRVAsa0JBQUFBLEdBQUcsR0FBR0EsR0FBRyxDQUFDakMsT0FBSixDQUFZLE9BQVosRUFBcUIsRUFBckIsQ0FBTjtBQUNBaUMsa0JBQUFBLEdBQUcsR0FBR0EsR0FBRyxDQUFDakMsT0FBSixDQUFZLE9BQVosRUFBcUIsRUFBckIsQ0FBTjtBQUNBaUMsa0JBQUFBLEdBQUcsR0FBR0EsR0FBRyxDQUFDakMsT0FBSixDQUFZekIsT0FBTyxDQUFDcUIsR0FBUixFQUFaLEVBQTJCLEVBQTNCLEVBQStCYSxJQUEvQixFQUFOOztBQUNBLHNCQUFJd0IsR0FBRyxDQUFDakcsUUFBSixDQUFhLE9BQWIsQ0FBSixFQUEyQjtBQUN6QmhCLG9CQUFBQSxXQUFXLENBQUNtRCxNQUFaLENBQW1CbEYsSUFBbkIsQ0FBd0JjLEdBQUcsR0FBR2tJLEdBQUcsQ0FBQ2pDLE9BQUosQ0FBWSxhQUFaLEVBQTJCLEVBQTNCLENBQTlCO0FBQ0FpQyxvQkFBQUEsR0FBRyxHQUFHQSxHQUFHLENBQUNqQyxPQUFKLENBQVksT0FBWixFQUFzQixHQUFFM0IsS0FBSyxDQUFDQyxHQUFOLENBQVUsT0FBVixDQUFtQixFQUEzQyxDQUFOO0FBQ0Q7O0FBQ0RoRSxrQkFBQUEsR0FBRyxDQUFDUCxHQUFELEVBQU1rSSxHQUFOLENBQUg7QUFDRDtBQUNGO0FBQ0YsYUEvQkQ7QUFnQ0FQLFlBQUFBLEtBQUssQ0FBQ2UsTUFBTixDQUFhZCxFQUFiLENBQWdCLE1BQWhCLEVBQXlCbEYsSUFBRCxJQUFVO0FBQ2hDeEMsY0FBQUEsSUFBSSxDQUFDcEIsT0FBRCxFQUFXLGtCQUFELEdBQXFCNEQsSUFBL0IsQ0FBSjtBQUNBLGtCQUFJd0YsR0FBRyxHQUFHeEYsSUFBSSxDQUFDNUIsUUFBTCxHQUFnQm1GLE9BQWhCLENBQXdCLFdBQXhCLEVBQXFDLEdBQXJDLEVBQTBDUyxJQUExQyxFQUFWO0FBQ0Esa0JBQUlpQyxXQUFXLEdBQUcseUJBQWxCO0FBQ0Esa0JBQUkxRyxRQUFRLEdBQUdpRyxHQUFHLENBQUNqRyxRQUFKLENBQWEwRyxXQUFiLENBQWY7O0FBQ0Esa0JBQUksQ0FBQzFHLFFBQUwsRUFBZTtBQUNiRyxnQkFBQUEsT0FBTyxDQUFDN0IsR0FBUixDQUFhLEdBQUVQLEdBQUksSUFBR3NFLEtBQUssQ0FBQ0MsR0FBTixDQUFVLE9BQVYsQ0FBbUIsSUFBRzJELEdBQUksRUFBaEQ7QUFDRDtBQUNGLGFBUkQ7QUFTRCxXQXhESyxDQVZIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHOzs7O0FBNEVQLFNBQVMvRyxTQUFULENBQW1CeUgsVUFBbkIsRUFBK0J0RixRQUEvQixFQUF5QztBQUN2QyxNQUFJdUYsWUFBWSxHQUFHakssT0FBTyxDQUFDLGVBQUQsQ0FBMUIsQ0FEdUMsQ0FFdkM7OztBQUNBLE1BQUlrSyxPQUFPLEdBQUcsS0FBZDtBQUNBLE1BQUl0RSxPQUFPLEdBQUdxRSxZQUFZLENBQUNFLElBQWIsQ0FBa0JILFVBQWxCLENBQWQsQ0FKdUMsQ0FLdkM7O0FBQ0FwRSxFQUFBQSxPQUFPLENBQUNvRCxFQUFSLENBQVcsT0FBWCxFQUFvQixVQUFVeEcsR0FBVixFQUFlO0FBQ2pDLFFBQUkwSCxPQUFKLEVBQWE7QUFDYkEsSUFBQUEsT0FBTyxHQUFHLElBQVY7QUFDQXhGLElBQUFBLFFBQVEsQ0FBQ2xDLEdBQUQsQ0FBUjtBQUNELEdBSkQsRUFOdUMsQ0FXdkM7O0FBQ0FvRCxFQUFBQSxPQUFPLENBQUNvRCxFQUFSLENBQVcsTUFBWCxFQUFtQixVQUFVQyxJQUFWLEVBQWdCO0FBQ2pDLFFBQUlpQixPQUFKLEVBQWE7QUFDYkEsSUFBQUEsT0FBTyxHQUFHLElBQVY7QUFDQSxRQUFJMUgsR0FBRyxHQUFHeUcsSUFBSSxLQUFLLENBQVQsR0FBYSxJQUFiLEdBQW9CLElBQUlFLEtBQUosQ0FBVSxlQUFlRixJQUF6QixDQUE5QjtBQUNBdkUsSUFBQUEsUUFBUSxDQUFDbEMsR0FBRCxDQUFSO0FBQ0QsR0FMRDtBQU1ELEMsQ0FFRDs7O0FBQ08sU0FBUzRILFFBQVQsQ0FBa0JkLEdBQWxCLEVBQXVCO0FBQzVCLFNBQU9BLEdBQUcsQ0FBQ2xHLFdBQUosR0FBa0JpRSxPQUFsQixDQUEwQixJQUExQixFQUFnQyxHQUFoQyxDQUFQO0FBQ0QsQyxDQUVEOzs7QUFDTyxTQUFTaEcsT0FBVCxHQUFtQjtBQUN4QixNQUFJcUUsS0FBSyxHQUFHMUYsT0FBTyxDQUFDLE9BQUQsQ0FBbkI7O0FBQ0EsTUFBSXFLLE1BQU0sR0FBSSxFQUFkOztBQUNBLFFBQU1DLFFBQVEsR0FBR3RLLE9BQU8sQ0FBQyxJQUFELENBQVAsQ0FBY3NLLFFBQWQsRUFBakI7O0FBQ0EsTUFBSUEsUUFBUSxJQUFJLFFBQWhCLEVBQTBCO0FBQUVELElBQUFBLE1BQU0sR0FBSSxVQUFWO0FBQXFCLEdBQWpELE1BQ0s7QUFBRUEsSUFBQUEsTUFBTSxHQUFJLFVBQVY7QUFBcUI7O0FBQzVCLFNBQVEsR0FBRTNFLEtBQUssQ0FBQzZFLEtBQU4sQ0FBWUYsTUFBWixDQUFvQixHQUE5QjtBQUNELEMsQ0FFRDs7O0FBQ08sU0FBU3pJLFlBQVQsQ0FBc0JULFVBQXRCLEVBQWtDcUosYUFBbEMsRUFBaUQ7QUFDeEQsTUFBSTtBQUNGLFVBQU16RyxJQUFJLEdBQUcvRCxPQUFPLENBQUMsTUFBRCxDQUFwQjs7QUFDQSxVQUFNRCxFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLFFBQUk2SixDQUFDLEdBQUcsRUFBUjtBQUNBLFFBQUlZLGFBQWEsR0FBRyxLQUFwQjtBQUVBWixJQUFBQSxDQUFDLENBQUNhLGFBQUYsR0FBa0IsS0FBbEI7QUFDQWIsSUFBQUEsQ0FBQyxDQUFDYyxVQUFGLEdBQWUsS0FBZjtBQUNBZCxJQUFBQSxDQUFDLENBQUNlLE9BQUYsR0FBWSxLQUFaO0FBQ0FmLElBQUFBLENBQUMsQ0FBQ2dCLFVBQUYsR0FBZSxLQUFmO0FBQ0FoQixJQUFBQSxDQUFDLENBQUNpQixjQUFGLEdBQW1CLEtBQW5CO0FBRUEsUUFBSUMsVUFBVSxHQUFHaEgsSUFBSSxDQUFDa0UsT0FBTCxDQUFhckMsT0FBTyxDQUFDcUIsR0FBUixFQUFiLEVBQTJCLHNCQUEzQixFQUFtRDlGLFVBQW5ELENBQWpCO0FBQ0EsUUFBSTZKLFNBQVMsR0FBSWpMLEVBQUUsQ0FBQ2MsVUFBSCxDQUFja0ssVUFBVSxHQUFDLGVBQXpCLEtBQTZDakssSUFBSSxDQUFDQyxLQUFMLENBQVdoQixFQUFFLENBQUNpQixZQUFILENBQWdCK0osVUFBVSxHQUFDLGVBQTNCLEVBQTRDLE9BQTVDLENBQVgsQ0FBN0MsSUFBaUgsRUFBbEk7QUFDQWxCLElBQUFBLENBQUMsQ0FBQ2EsYUFBRixHQUFrQk0sU0FBUyxDQUFDQyxPQUE1QjtBQUNBcEIsSUFBQUEsQ0FBQyxDQUFDcUIsU0FBRixHQUFjRixTQUFTLENBQUNFLFNBQXhCOztBQUNBLFFBQUlyQixDQUFDLENBQUNxQixTQUFGLElBQWU5SyxTQUFuQixFQUE4QjtBQUM1QnlKLE1BQUFBLENBQUMsQ0FBQ2UsT0FBRixHQUFhLFlBQWI7QUFDRCxLQUZELE1BR0s7QUFDSCxVQUFJLENBQUMsQ0FBRCxJQUFNZixDQUFDLENBQUNxQixTQUFGLENBQVl2RCxPQUFaLENBQW9CLFdBQXBCLENBQVYsRUFBNEM7QUFDMUNrQyxRQUFBQSxDQUFDLENBQUNlLE9BQUYsR0FBYSxZQUFiO0FBQ0QsT0FGRCxNQUdLO0FBQ0hmLFFBQUFBLENBQUMsQ0FBQ2UsT0FBRixHQUFhLFdBQWI7QUFDRDtBQUNGOztBQUNELFFBQUlPLFdBQVcsR0FBR3BILElBQUksQ0FBQ2tFLE9BQUwsQ0FBYXJDLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBYixFQUEyQixzQkFBM0IsQ0FBbEI7QUFDQSxRQUFJbUUsVUFBVSxHQUFJckwsRUFBRSxDQUFDYyxVQUFILENBQWNzSyxXQUFXLEdBQUMsZUFBMUIsS0FBOENySyxJQUFJLENBQUNDLEtBQUwsQ0FBV2hCLEVBQUUsQ0FBQ2lCLFlBQUgsQ0FBZ0JtSyxXQUFXLEdBQUMsZUFBNUIsRUFBNkMsT0FBN0MsQ0FBWCxDQUE5QyxJQUFtSCxFQUFySTtBQUNBdEIsSUFBQUEsQ0FBQyxDQUFDaUIsY0FBRixHQUFtQk0sVUFBVSxDQUFDSCxPQUE5QjtBQUNBLFFBQUkvRyxPQUFPLEdBQUdILElBQUksQ0FBQ2tFLE9BQUwsQ0FBYXJDLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBYixFQUEyQiwwQkFBM0IsQ0FBZDtBQUNBLFFBQUlvRSxNQUFNLEdBQUl0TCxFQUFFLENBQUNjLFVBQUgsQ0FBY3FELE9BQU8sR0FBQyxlQUF0QixLQUEwQ3BELElBQUksQ0FBQ0MsS0FBTCxDQUFXaEIsRUFBRSxDQUFDaUIsWUFBSCxDQUFnQmtELE9BQU8sR0FBQyxlQUF4QixFQUF5QyxPQUF6QyxDQUFYLENBQTFDLElBQTJHLEVBQXpIO0FBQ0EyRixJQUFBQSxDQUFDLENBQUNjLFVBQUYsR0FBZVUsTUFBTSxDQUFDdEQsTUFBUCxDQUFja0QsT0FBN0I7QUFDQSxRQUFJSyxPQUFPLEdBQUd2SCxJQUFJLENBQUNrRSxPQUFMLENBQWFyQyxPQUFPLENBQUNxQixHQUFSLEVBQWIsRUFBNEIsMEJBQTVCLENBQWQ7QUFDQSxRQUFJc0UsTUFBTSxHQUFJeEwsRUFBRSxDQUFDYyxVQUFILENBQWN5SyxPQUFPLEdBQUMsZUFBdEIsS0FBMEN4SyxJQUFJLENBQUNDLEtBQUwsQ0FBV2hCLEVBQUUsQ0FBQ2lCLFlBQUgsQ0FBZ0JzSyxPQUFPLEdBQUMsZUFBeEIsRUFBeUMsT0FBekMsQ0FBWCxDQUExQyxJQUEyRyxFQUF6SDtBQUNBekIsSUFBQUEsQ0FBQyxDQUFDZ0IsVUFBRixHQUFlVSxNQUFNLENBQUNDLFlBQXRCOztBQUNBLFFBQUkzQixDQUFDLENBQUNnQixVQUFGLElBQWdCekssU0FBcEIsRUFBK0I7QUFDN0IsVUFBSWtMLE9BQU8sR0FBR3ZILElBQUksQ0FBQ2tFLE9BQUwsQ0FBYXJDLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBYixFQUE0Qix3QkFBdUI5RixVQUFXLDJCQUE5RCxDQUFkO0FBQ0EsVUFBSW9LLE1BQU0sR0FBSXhMLEVBQUUsQ0FBQ2MsVUFBSCxDQUFjeUssT0FBTyxHQUFDLGVBQXRCLEtBQTBDeEssSUFBSSxDQUFDQyxLQUFMLENBQVdoQixFQUFFLENBQUNpQixZQUFILENBQWdCc0ssT0FBTyxHQUFDLGVBQXhCLEVBQXlDLE9BQXpDLENBQVgsQ0FBMUMsSUFBMkcsRUFBekg7QUFDQXpCLE1BQUFBLENBQUMsQ0FBQ2dCLFVBQUYsR0FBZVUsTUFBTSxDQUFDQyxZQUF0QjtBQUNEOztBQUVBLFFBQUloQixhQUFhLElBQUlwSyxTQUFqQixJQUE4Qm9LLGFBQWEsSUFBSSxPQUFuRCxFQUE0RDtBQUMzRCxVQUFJaUIsYUFBYSxHQUFHLEVBQXBCOztBQUNBLFVBQUlqQixhQUFhLElBQUksT0FBckIsRUFBOEI7QUFDNUJpQixRQUFBQSxhQUFhLEdBQUcxSCxJQUFJLENBQUNrRSxPQUFMLENBQWFyQyxPQUFPLENBQUNxQixHQUFSLEVBQWIsRUFBMkIsb0JBQTNCLENBQWhCO0FBQ0Q7O0FBQ0QsVUFBSXVELGFBQWEsSUFBSSxTQUFyQixFQUFnQztBQUM5QmlCLFFBQUFBLGFBQWEsR0FBRzFILElBQUksQ0FBQ2tFLE9BQUwsQ0FBYXJDLE9BQU8sQ0FBQ3FCLEdBQVIsRUFBYixFQUEyQiw0QkFBM0IsQ0FBaEI7QUFDRDs7QUFDRCxVQUFJeUUsWUFBWSxHQUFJM0wsRUFBRSxDQUFDYyxVQUFILENBQWM0SyxhQUFhLEdBQUMsZUFBNUIsS0FBZ0QzSyxJQUFJLENBQUNDLEtBQUwsQ0FBV2hCLEVBQUUsQ0FBQ2lCLFlBQUgsQ0FBZ0J5SyxhQUFhLEdBQUMsZUFBOUIsRUFBK0MsT0FBL0MsQ0FBWCxDQUFoRCxJQUF1SCxFQUEzSTtBQUNBNUIsTUFBQUEsQ0FBQyxDQUFDOEIsZ0JBQUYsR0FBcUJELFlBQVksQ0FBQ1QsT0FBbEM7O0FBQ0EsVUFBSXBCLENBQUMsQ0FBQzhCLGdCQUFGLElBQXNCdkwsU0FBMUIsRUFBcUM7QUFDbkNxSyxRQUFBQSxhQUFhLEdBQUcsT0FBT0QsYUFBdkI7QUFDRCxPQUZELE1BR0s7QUFDSEMsUUFBQUEsYUFBYSxHQUFHLE9BQU9ELGFBQVAsR0FBdUIsSUFBdkIsR0FBOEJYLENBQUMsQ0FBQzhCLGdCQUFoRDtBQUNEO0FBQ0Y7O0FBQ0QsV0FBTyx5QkFBeUI5QixDQUFDLENBQUNhLGFBQTNCLEdBQTJDLFlBQTNDLEdBQTBEYixDQUFDLENBQUNjLFVBQTVELEdBQXlFLEdBQXpFLEdBQStFZCxDQUFDLENBQUNlLE9BQWpGLEdBQTJGLHdCQUEzRixHQUFzSGYsQ0FBQyxDQUFDZ0IsVUFBeEgsR0FBcUksYUFBckksR0FBcUpoQixDQUFDLENBQUNpQixjQUF2SixHQUF3S0wsYUFBL0s7QUFFRCxHQTdERCxDQThEQSxPQUFPeEksQ0FBUCxFQUFVO0FBQ1IsV0FBTyx5QkFBeUI0SCxDQUFDLENBQUNhLGFBQTNCLEdBQTJDLFlBQTNDLEdBQTBEYixDQUFDLENBQUNjLFVBQTVELEdBQXlFLEdBQXpFLEdBQStFZCxDQUFDLENBQUNlLE9BQWpGLEdBQTJGLHdCQUEzRixHQUFzSGYsQ0FBQyxDQUFDZ0IsVUFBeEgsR0FBcUksYUFBckksR0FBcUpoQixDQUFDLENBQUNpQixjQUF2SixHQUF3S0wsYUFBL0s7QUFDRDtBQUVBLEMsQ0FFRDs7O0FBQ08sU0FBUzlJLEdBQVQsQ0FBYVAsR0FBYixFQUFpQndLLE9BQWpCLEVBQTBCO0FBQy9CLE1BQUlDLENBQUMsR0FBR3pLLEdBQUcsR0FBR3dLLE9BQWQ7O0FBQ0E1TCxFQUFBQSxPQUFPLENBQUMsVUFBRCxDQUFQLENBQW9COEwsUUFBcEIsQ0FBNkJsRyxPQUFPLENBQUN5RCxNQUFyQyxFQUE2QyxDQUE3Qzs7QUFDQSxNQUFJO0FBQUN6RCxJQUFBQSxPQUFPLENBQUN5RCxNQUFSLENBQWUwQyxTQUFmO0FBQTJCLEdBQWhDLENBQWdDLE9BQU05SixDQUFOLEVBQVMsQ0FBRTs7QUFDM0MyRCxFQUFBQSxPQUFPLENBQUN5RCxNQUFSLENBQWUyQyxLQUFmLENBQXFCSCxDQUFyQjtBQUF3QmpHLEVBQUFBLE9BQU8sQ0FBQ3lELE1BQVIsQ0FBZTJDLEtBQWYsQ0FBcUIsSUFBckI7QUFDekIsQyxDQUVEOzs7QUFDTyxTQUFTQyxJQUFULENBQWM3SyxHQUFkLEVBQWtCd0ssT0FBbEIsRUFBMkI7QUFDaEMsTUFBSU0sQ0FBQyxHQUFHLEtBQVI7QUFDQSxNQUFJTCxDQUFDLEdBQUd6SyxHQUFHLEdBQUd3SyxPQUFkOztBQUNBLE1BQUlNLENBQUMsSUFBSSxJQUFULEVBQWU7QUFDYmxNLElBQUFBLE9BQU8sQ0FBQyxVQUFELENBQVAsQ0FBb0I4TCxRQUFwQixDQUE2QmxHLE9BQU8sQ0FBQ3lELE1BQXJDLEVBQTZDLENBQTdDOztBQUNBLFFBQUk7QUFDRnpELE1BQUFBLE9BQU8sQ0FBQ3lELE1BQVIsQ0FBZTBDLFNBQWY7QUFDRCxLQUZELENBR0EsT0FBTTlKLENBQU4sRUFBUyxDQUFFOztBQUNYMkQsSUFBQUEsT0FBTyxDQUFDeUQsTUFBUixDQUFlMkMsS0FBZixDQUFxQkgsQ0FBckI7QUFDQWpHLElBQUFBLE9BQU8sQ0FBQ3lELE1BQVIsQ0FBZTJDLEtBQWYsQ0FBcUIsSUFBckI7QUFDRDtBQUNGLEMsQ0FFRDs7O0FBQ08sU0FBUzFLLElBQVQsQ0FBY2IsT0FBZCxFQUF1Qm9MLENBQXZCLEVBQTBCO0FBQy9CLE1BQUlwTCxPQUFPLElBQUksS0FBZixFQUFzQjtBQUNwQlQsSUFBQUEsT0FBTyxDQUFDLFVBQUQsQ0FBUCxDQUFvQjhMLFFBQXBCLENBQTZCbEcsT0FBTyxDQUFDeUQsTUFBckMsRUFBNkMsQ0FBN0M7O0FBQ0EsUUFBSTtBQUNGekQsTUFBQUEsT0FBTyxDQUFDeUQsTUFBUixDQUFlMEMsU0FBZjtBQUNELEtBRkQsQ0FHQSxPQUFNOUosQ0FBTixFQUFTLENBQUU7O0FBQ1gyRCxJQUFBQSxPQUFPLENBQUN5RCxNQUFSLENBQWUyQyxLQUFmLENBQXNCLGFBQVlILENBQUUsRUFBcEM7QUFDQWpHLElBQUFBLE9BQU8sQ0FBQ3lELE1BQVIsQ0FBZTJDLEtBQWYsQ0FBcUIsSUFBckI7QUFDRDtBQUNGOztBQUVELFNBQVNyTCxtQkFBVCxHQUErQjtBQUM3QixTQUFPO0FBQ0wsWUFBUSxRQURIO0FBRUwsa0JBQWM7QUFDWixtQkFBYTtBQUNYLGdCQUFRLENBQUMsUUFBRDtBQURHLE9BREQ7QUFJWixpQkFBVztBQUNULGdCQUFRLENBQUMsUUFBRDtBQURDLE9BSkM7QUFPWixlQUFTO0FBQ1AsZ0JBQVEsQ0FBQyxRQUFEO0FBREQsT0FQRztBQVVaLGNBQVE7QUFDTix3QkFBZ0IsMERBRFY7QUFFTixnQkFBUSxDQUFDLFFBQUQ7QUFGRixPQVZJO0FBY1osZ0JBQVU7QUFDUixnQkFBUSxDQUFDLFFBQUQ7QUFEQSxPQWRFO0FBaUJaLGNBQVE7QUFDTixnQkFBUSxDQUFDLFNBQUQ7QUFERixPQWpCSTtBQW9CWixrQkFBWTtBQUNWLGdCQUFRLENBQUMsUUFBRCxFQUFXLE9BQVg7QUFERSxPQXBCQTtBQXVCWixpQkFBVztBQUNULGdCQUFRLENBQUMsUUFBRDtBQURDLE9BdkJDO0FBMEJaLHFCQUFlO0FBQ2Isd0JBQWdCLHNEQURIO0FBRWIsZ0JBQVEsQ0FBQyxRQUFEO0FBRkssT0ExQkg7QUE4QlosbUJBQWE7QUFDWCx3QkFBZ0IsMERBREw7QUFFWCxnQkFBUSxDQUFDLFFBQUQ7QUFGRyxPQTlCRDtBQWtDWixpQkFBVztBQUNULHdCQUFnQiwwREFEUDtBQUVULGdCQUFRLENBQUMsUUFBRDtBQUZDLE9BbENDO0FBc0NaLGVBQVM7QUFDUCx3QkFBZ0IsMERBRFQ7QUFFUCxnQkFBUSxDQUFDLFFBQUQ7QUFGRCxPQXRDRztBQTBDWixpQkFBVztBQUNULHdCQUFnQiwwREFEUDtBQUVULGdCQUFRLENBQUMsUUFBRDtBQUZDLE9BMUNDO0FBOENaLGdCQUFVO0FBQ1Isd0JBQWdCLDBEQURSO0FBRVIsZ0JBQVEsQ0FBQyxRQUFEO0FBRkEsT0E5Q0U7QUFrRFosc0JBQWdCO0FBQ2Qsd0JBQWdCLDBEQURGO0FBRWQsZ0JBQVEsQ0FBQyxRQUFEO0FBRk07QUFsREosS0FGVDtBQXlETCw0QkFBd0I7QUF6RG5CLEdBQVA7QUEyREQ7O0FBR0QsU0FBU00sa0JBQVQsR0FBOEI7QUFDNUIsU0FBTztBQUNMZCxJQUFBQSxTQUFTLEVBQUUsT0FETjtBQUVMa0csSUFBQUEsT0FBTyxFQUFFLFFBRko7QUFHTEMsSUFBQUEsS0FBSyxFQUFFLGdCQUhGO0FBSUwzQixJQUFBQSxJQUFJLEVBQUUsS0FKRDtBQUtMckMsSUFBQUEsTUFBTSxFQUFFLElBTEg7QUFNTDJELElBQUFBLElBQUksRUFBRSxJQU5EO0FBT0xHLElBQUFBLFFBQVEsRUFBRSxFQVBMO0FBU0xqQixJQUFBQSxPQUFPLEVBQUUsRUFUSjtBQVVMNUQsSUFBQUEsV0FBVyxFQUFFLGFBVlI7QUFXTGYsSUFBQUEsU0FBUyxFQUFFLElBWE47QUFZTGlCLElBQUFBLE9BQU8sRUFBRSxLQVpKO0FBYUxDLElBQUFBLEtBQUssRUFBRSxLQWJGO0FBY0xqQixJQUFBQSxPQUFPLEVBQUUsSUFkSjtBQWVMbUQsSUFBQUEsTUFBTSxFQUFFLEtBZkg7QUFnQkwvQixJQUFBQSxZQUFZLEVBQUU7QUFoQlQsR0FBUDtBQWtCRCIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2NvbnN0cnVjdG9yKGluaXRpYWxPcHRpb25zKSB7XG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICB2YXIgdmFycyA9IHt9XG4gIHZhciBvcHRpb25zID0ge31cbiAgdHJ5IHtcbiAgICBpZiAoaW5pdGlhbE9wdGlvbnMuZnJhbWV3b3JrID09IHVuZGVmaW5lZCkge1xuICAgICAgdmFycy5wbHVnaW5FcnJvcnMgPSBbXVxuICAgICAgdmFycy5wbHVnaW5FcnJvcnMucHVzaCgnd2VicGFjayBjb25maWc6IGZyYW1ld29yayBwYXJhbWV0ZXIgb24gZXh0LXdlYnBhY2stcGx1Z2luIGlzIG5vdCBkZWZpbmVkIC0gdmFsdWVzOiByZWFjdCwgYW5ndWxhciwgZXh0anMsIHdlYi1jb21wb25lbnRzJylcbiAgICAgIHZhciByZXN1bHQgPSB7IHZhcnM6IHZhcnMgfTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHZhciBmcmFtZXdvcmsgPSBpbml0aWFsT3B0aW9ucy5mcmFtZXdvcmtcbiAgICB2YXIgdHJlZXNoYWtlID0gaW5pdGlhbE9wdGlvbnMudHJlZXNoYWtlXG4gICAgdmFyIHZlcmJvc2UgPSBpbml0aWFsT3B0aW9ucy52ZXJib3NlXG5cbiAgICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICAgIHZhbGlkYXRlT3B0aW9ucyhfZ2V0VmFsaWRhdGVPcHRpb25zKCksIGluaXRpYWxPcHRpb25zLCAnJylcblxuICAgIGNvbnN0IHJjID0gKGZzLmV4aXN0c1N5bmMoYC5leHQtJHtmcmFtZXdvcmt9cmNgKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgLmV4dC0ke2ZyYW1ld29ya31yY2AsICd1dGYtOCcpKSB8fCB7fSlcbiAgICBvcHRpb25zID0geyAuLi5fZ2V0RGVmYXVsdE9wdGlvbnMoKSwgLi4uaW5pdGlhbE9wdGlvbnMsIC4uLnJjIH1cblxuICAgIHZhcnMgPSByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fZ2V0RGVmYXVsdFZhcnMoKVxuICAgIHZhcnMucGx1Z2luTmFtZSA9ICdleHQtd2VicGFjay1wbHVnaW4nXG4gICAgdmFycy5hcHAgPSBfZ2V0QXBwKClcbiAgICB2YXIgcGx1Z2luTmFtZSA9IHZhcnMucGx1Z2luTmFtZVxuICAgIHZhciBhcHAgPSB2YXJzLmFwcFxuXG4gICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2NvbnN0cnVjdG9yJylcbiAgICBsb2d2KHZlcmJvc2UsIGBwbHVnaW5OYW1lIC0gJHtwbHVnaW5OYW1lfWApXG4gICAgbG9ndih2ZXJib3NlLCBgYXBwIC0gJHthcHB9YClcblxuICAgIGlmIChvcHRpb25zLmVudmlyb25tZW50ID09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFycy5wcm9kdWN0aW9uID0gdHJ1ZVxuICAgICAgb3B0aW9ucy5icm93c2VyID0gJ25vJ1xuICAgICAgb3B0aW9ucy53YXRjaCA9ICdubydcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXJzLnByb2R1Y3Rpb24gPSBmYWxzZVxuICAgIH1cblxuICAgIGxvZyhhcHAsIF9nZXRWZXJzaW9ucyhwbHVnaW5OYW1lLCBmcmFtZXdvcmspKVxuXG4gICAgLy9tamcgYWRkZWQgZm9yIGFuZ3VsYXIgY2xpIGJ1aWxkXG4gICAgaWYgKGZyYW1ld29yayA9PSAnYW5ndWxhcicgJiZcbiAgICAgICAgb3B0aW9ucy5pbnRlbGxpc2hha2UgPT0gJ25vJyAmJlxuICAgICAgICB2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZVxuICAgICAgICAmJiB0cmVlc2hha2UgPT0gJ3llcycpIHtcbiAgICAgICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMSc7XG4gICAgICAgICAgICBsb2coYXBwLCAnU3RhcnRpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJyArIGZyYW1ld29yayk7XG4gICAgfVxuXG4gICAgZWxzZSBpZiAoZnJhbWV3b3JrID09ICdyZWFjdCcgfHwgZnJhbWV3b3JrID09ICdleHRqcycgfHwgZnJhbWV3b3JrID09ICd3ZWItY29tcG9uZW50cycpIHtcbiAgICAgIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgICB2YXJzLmJ1aWxkc3RlcCA9ICcxIG9mIDEnXG4gICAgICAgIGxvZyhhcHAsICdTdGFydGluZyBwcm9kdWN0aW9uIGJ1aWxkIGZvciAnICsgZnJhbWV3b3JrKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMSdcbiAgICAgICAgbG9nKGFwcCwgJ1N0YXJ0aW5nIGRldmVsb3BtZW50IGJ1aWxkIGZvciAnICsgZnJhbWV3b3JrKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgaWYgKHRyZWVzaGFrZSA9PSAneWVzJykge1xuICAgICAgICB2YXJzLmJ1aWxkc3RlcCA9ICcxIG9mIDInXG4gICAgICAgIGxvZyhhcHAsICdTdGFydGluZyBwcm9kdWN0aW9uIGJ1aWxkIGZvciAnICsgZnJhbWV3b3JrICsgJyAtICcgKyB2YXJzLmJ1aWxkc3RlcClcbiAgICAgICAgcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX3RvUHJvZCh2YXJzLCBvcHRpb25zKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzIgb2YgMidcbiAgICAgICAgbG9nKGFwcCwgJ0NvbnRpbnVpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJyArIGZyYW1ld29yayArICcgLSAnICsgdmFycy5idWlsZHN0ZXApXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFycy5idWlsZHN0ZXAgPSAnMSBvZiAxJ1xuICAgICAgbG9nKGFwcCwgJ1N0YXJ0aW5nIGRldmVsb3BtZW50IGJ1aWxkIGZvciAnICsgZnJhbWV3b3JrKVxuICAgIH1cbiAgICBsb2d2KHZlcmJvc2UsICdCdWlsZGluZyBmb3IgJyArIG9wdGlvbnMuZW52aXJvbm1lbnQgKyAnLCAnICsgJ3RyZWVzaGFrZSBpcyAnICsgb3B0aW9ucy50cmVlc2hha2UrICcsICcgKyAnaW50ZWxsaXNoYWtlIGlzICcgKyBvcHRpb25zLmludGVsbGlzaGFrZSlcblxuICAgIHZhciBjb25maWdPYmogPSB7IHZhcnM6IHZhcnMsIG9wdGlvbnM6IG9wdGlvbnMgfTtcbiAgICByZXR1cm4gY29uZmlnT2JqO1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgdGhyb3cgJ19jb25zdHJ1Y3RvcjogJyArIGUudG9TdHJpbmcoKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF90aGlzQ29tcGlsYXRpb24oY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgdmFyIGFwcCA9IHZhcnMuYXBwXG4gICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICBsb2d2KHZlcmJvc2UsICdGVU5DVElPTiBfdGhpc0NvbXBpbGF0aW9uJylcbiAgICBsb2d2KHZlcmJvc2UsIGBvcHRpb25zLnNjcmlwdDogJHtvcHRpb25zLnNjcmlwdCB9YClcbiAgICBsb2d2KHZlcmJvc2UsIGBidWlsZHN0ZXA6ICR7dmFycy5idWlsZHN0ZXB9YClcblxuICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PT0gJzEgb2YgMScgfHwgdmFycy5idWlsZHN0ZXAgPT09ICcxIG9mIDInKSB7XG4gICAgICBpZiAob3B0aW9ucy5zY3JpcHQgIT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuc2NyaXB0ICE9IG51bGwgJiYgb3B0aW9ucy5zY3JpcHQgIT0gJycpIHtcbiAgICAgICAgbG9nKGFwcCwgYFN0YXJ0ZWQgcnVubmluZyAke29wdGlvbnMuc2NyaXB0fWApXG4gICAgICAgIHJ1blNjcmlwdChvcHRpb25zLnNjcmlwdCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9nKGFwcCwgYEZpbmlzaGVkIHJ1bm5pbmcgJHtvcHRpb25zLnNjcmlwdH1gKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHRocm93ICdfdGhpc0NvbXBpbGF0aW9uOiAnICsgZS50b1N0cmluZygpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2NvbXBpbGF0aW9uKGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucykge1xuICB0cnkge1xuICAgIHZhciBhcHAgPSB2YXJzLmFwcFxuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgdmFyIGZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2NvbXBpbGF0aW9uJylcblxuICAgIGlmIChmcmFtZXdvcmsgIT0gJ2V4dGpzJykge1xuICAgICAgaWYgKG9wdGlvbnMudHJlZXNoYWtlID09PSAneWVzJyAmJiBvcHRpb25zLmVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgdmFyIGV4dENvbXBvbmVudHMgPSBbXTtcblxuICAgICAgICAvL21qZyBmb3IgMSBzdGVwIGJ1aWxkXG4gICAgICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAxJyAmJiBmcmFtZXdvcmsgPT09ICdhbmd1bGFyJyAmJiBvcHRpb25zLmludGVsbGlzaGFrZSA9PSAnbm8nKSB7XG4gICAgICAgICAgICBleHRDb21wb25lbnRzID0gcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX2dldEFsbENvbXBvbmVudHModmFycywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMicgfHwgKHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDEnICYmIGZyYW1ld29yayA9PT0gJ3dlYi1jb21wb25lbnRzJykpIHtcbiAgICAgICAgICBleHRDb21wb25lbnRzID0gcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX2dldEFsbENvbXBvbmVudHModmFycywgb3B0aW9ucylcbiAgICAgICAgfVxuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5zdWNjZWVkTW9kdWxlLnRhcChgZXh0LXN1Y2NlZWQtbW9kdWxlYCwgbW9kdWxlID0+IHtcbiAgICAgICAgICBpZiAobW9kdWxlLnJlc291cmNlICYmICFtb2R1bGUucmVzb3VyY2UubWF0Y2goL25vZGVfbW9kdWxlcy8pKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGUucmVzb3VyY2UubWF0Y2goL1xcLmh0bWwkLykgIT0gbnVsbFxuICAgICAgICAgICAgICAgICYmIG1vZHVsZS5fc291cmNlLl92YWx1ZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdkb2N0eXBlIGh0bWwnKSA9PSBmYWxzZVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICB2YXJzLmRlcHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4odmFycy5kZXBzIHx8IFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9leHRyYWN0RnJvbVNvdXJjZShtb2R1bGUsIG9wdGlvbnMsIGNvbXBpbGF0aW9uLCBleHRDb21wb25lbnRzKV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXJzLmRlcHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4odmFycy5kZXBzIHx8IFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9leHRyYWN0RnJvbVNvdXJjZShtb2R1bGUsIG9wdGlvbnMsIGNvbXBpbGF0aW9uLCBleHRDb21wb25lbnRzKV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAyJykge1xuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5maW5pc2hNb2R1bGVzLnRhcChgZXh0LWZpbmlzaC1tb2R1bGVzYCwgbW9kdWxlcyA9PiB7XG4gICAgICAgICAgcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX3dyaXRlRmlsZXNUb1Byb2RGb2xkZXIodmFycywgb3B0aW9ucylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAxJyB8fCB2YXJzLmJ1aWxkc3RlcCA9PSAnMiBvZiAyJykge1xuICAgICAgICBpZiAob3B0aW9ucy5pbmplY3QgPT09ICd5ZXMnKSB7XG4gICAgICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5CZWZvcmVIdG1sR2VuZXJhdGlvbi50YXAoYGV4dC1odG1sLWdlbmVyYXRpb25gLChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICAgICAgICB2YXIganNQYXRoID0gcGF0aC5qb2luKHZhcnMuZXh0UGF0aCwgJ2V4dC5qcycpXG4gICAgICAgICAgICB2YXIgY3NzUGF0aCA9IHBhdGguam9pbih2YXJzLmV4dFBhdGgsICdleHQuY3NzJylcbiAgICAgICAgICAgIC8vdmFyIGpzUGF0aCA9IHZhcnMuZXh0UGF0aCArICcvJyArICAnZXh0LmpzJztcbiAgICAgICAgICAgIC8vdmFyIGNzc1BhdGggPSB2YXJzLmV4dFBhdGggKyAnLycgKyAnZXh0LmNzcyc7XG4gICAgICAgICAgICBkYXRhLmFzc2V0cy5qcy51bnNoaWZ0KGpzUGF0aClcbiAgICAgICAgICAgIGRhdGEuYXNzZXRzLmNzcy51bnNoaWZ0KGNzc1BhdGgpXG4gICAgICAgICAgICBsb2coYXBwLCBgQWRkaW5nICR7anNQYXRofSBhbmQgJHtjc3NQYXRofSB0byBpbmRleC5odG1sYClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICB0aHJvdyAnX2NvbXBpbGF0aW9uOiAnICsgZS50b1N0cmluZygpXG4vLyAgICBsb2d2KG9wdGlvbnMudmVyYm9zZSxlKVxuLy8gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19jb21waWxhdGlvbjogJyArIGUpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2FmdGVyQ29tcGlsZShjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYXBwID0gdmFycy5hcHBcbiAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgIHZhciBmcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9hZnRlckNvbXBpbGUnKVxuICAgIGlmIChmcmFtZXdvcmsgPT0gJ2V4dGpzJykge1xuICAgICAgcmVxdWlyZShgLi9leHRqc1V0aWxgKS5fYWZ0ZXJDb21waWxlKGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9hZnRlckNvbXBpbGUgbm90IHJ1bicpXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICB0aHJvdyAnX2FmdGVyQ29tcGlsZTogJyArIGUudG9TdHJpbmcoKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9lbWl0KGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgdmFyIGFwcCA9IHZhcnMuYXBwXG4gICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICB2YXIgZW1pdCA9IG9wdGlvbnMuZW1pdFxuICAgIHZhciBmcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICAgIGxvZ3YodmVyYm9zZSwnRlVOQ1RJT04gX2VtaXQnKVxuICAgIGlmIChlbWl0ID09ICd5ZXMnKSB7XG4gICAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMScgfHwgdmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMicpIHtcbiAgICAgICAgbGV0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3V0cHV0UGF0aCx2YXJzLmV4dFBhdGgpXG4gICAgICAgIGlmIChjb21waWxlci5vdXRwdXRQYXRoID09PSAnLycgJiYgY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIpIHtcbiAgICAgICAgICBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGNvbXBpbGVyLm9wdGlvbnMuZGV2U2VydmVyLmNvbnRlbnRCYXNlLCBvdXRwdXRQYXRoKVxuICAgICAgICB9XG4gICAgICAgIGxvZ3YodmVyYm9zZSwnb3V0cHV0UGF0aDogJyArIG91dHB1dFBhdGgpXG4gICAgICAgIGxvZ3YodmVyYm9zZSwnZnJhbWV3b3JrOiAnICsgZnJhbWV3b3JrKVxuICAgICAgICBpZiAoZnJhbWV3b3JrICE9ICdleHRqcycpIHtcbiAgICAgICAgICBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aCwgY29tcGlsYXRpb24pXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbW1hbmQgPSAnJ1xuICAgICAgICBpZiAob3B0aW9ucy53YXRjaCA9PSAneWVzJyAmJiB2YXJzLnByb2R1Y3Rpb24gPT0gZmFsc2UpXG4gICAgICAgICAge2NvbW1hbmQgPSAnd2F0Y2gnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAge2NvbW1hbmQgPSAnYnVpbGQnfVxuICAgICAgICBpZiAodmFycy5yZWJ1aWxkID09IHRydWUpIHtcbiAgICAgICAgICB2YXIgcGFybXMgPSBbXVxuICAgICAgICAgIGlmIChvcHRpb25zLnByb2ZpbGUgPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucHJvZmlsZSA9PSAnJyB8fCBvcHRpb25zLnByb2ZpbGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGNvbW1hbmQgPT0gJ2J1aWxkJylcbiAgICAgICAgICAgICAgeyBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgb3B0aW9ucy5lbnZpcm9ubWVudF0gfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB7IHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5lbnZpcm9ubWVudF0gfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb21tYW5kID09ICdidWlsZCcpXG4gICAgICAgICAgICAgIHtwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XX1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAge3Bhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XX1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHZhcnMud2F0Y2hTdGFydGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICBhd2FpdCBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIHZhcnMsIG9wdGlvbnMpXG4gICAgICAgICAgICB2YXJzLndhdGNoU3RhcnRlZCA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGxvZ3YodmVyYm9zZSwnTk9UIHJ1bm5pbmcgZW1pdCcpXG4gICAgICAgIGNhbGxiYWNrKClcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb2d2KHZlcmJvc2UsJ2VtaXQgaXMgbm8nKVxuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgY2FsbGJhY2soKVxuICAgIHRocm93ICdfZW1pdDogJyArIGUudG9TdHJpbmcoKVxuICAgIC8vIGxvZ3Yob3B0aW9ucy52ZXJib3NlLGUpXG4gICAgLy8gY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19lbWl0OiAnICsgZSlcbiAgICAvLyBjYWxsYmFjaygpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2RvbmUoc3RhdHMsIHZhcnMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgIHZhciBmcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICAgIGxvZ3YodmVyYm9zZSwnRlVOQ1RJT04gX2RvbmUnKVxuICAgIGlmIChzdGF0cy5jb21waWxhdGlvbi5lcnJvcnMgJiYgc3RhdHMuY29tcGlsYXRpb24uZXJyb3JzLmxlbmd0aCkgLy8gJiYgcHJvY2Vzcy5hcmd2LmluZGV4T2YoJy0td2F0Y2gnKSA9PSAtMSlcbiAgICB7XG4gICAgICB2YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpO1xuICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKSk7XG4gICAgICBjb25zb2xlLmxvZyhzdGF0cy5jb21waWxhdGlvbi5lcnJvcnNbMF0pO1xuICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfVxuXG4gICAgLy9tamcgcmVmYWN0b3JcbiAgICBpZiAodmFycy5wcm9kdWN0aW9uID09IHRydWUgJiYgb3B0aW9ucy50cmVlc2hha2UgPT0gJ25vJyAmJiBmcmFtZXdvcmsgPT0gJ2FuZ3VsYXInKSB7XG4gICAgICByZXF1aXJlKGAuLyR7b3B0aW9ucy5mcmFtZXdvcmt9VXRpbGApLl90b0Rldih2YXJzLCBvcHRpb25zKVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgaWYob3B0aW9ucy5icm93c2VyID09ICd5ZXMnICYmIG9wdGlvbnMud2F0Y2ggPT0gJ3llcycgJiYgdmFycy5wcm9kdWN0aW9uID09IGZhbHNlKSB7XG4gICAgICAgIGlmICh2YXJzLmJyb3dzZXJDb3VudCA9PSAwKSB7XG4gICAgICAgICAgdmFyIHVybCA9ICdodHRwOi8vbG9jYWxob3N0OicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBPcGVuaW5nIGJyb3dzZXIgYXQgJHt1cmx9YClcbiAgICAgICAgICB2YXJzLmJyb3dzZXJDb3VudCsrXG4gICAgICAgICAgY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJylcbiAgICAgICAgICBvcG4odXJsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKVxuICAgIH1cbiAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMScpIHtcbiAgICAgIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBFbmRpbmcgcHJvZHVjdGlvbiBidWlsZCBmb3IgJHtmcmFtZXdvcmt9YClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBFbmRpbmcgZGV2ZWxvcG1lbnQgYnVpbGQgZm9yICR7ZnJhbWV3b3JrfWApXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMiBvZiAyJykge1xuICAgICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9nKHZhcnMuYXBwLCBgRW5kaW5nIHByb2R1Y3Rpb24gYnVpbGQgZm9yICR7ZnJhbWV3b3JrfWApXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbi8vICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucy52ZXJib3NlLGUpXG4gICAgdGhyb3cgJ19kb25lOiAnICsgZS50b1N0cmluZygpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dCwgY29tcGlsYXRpb24pIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgIHZhciBwYWNrYWdlcyA9IG9wdGlvbnMucGFja2FnZXNcbiAgICB2YXIgdG9vbGtpdCA9IG9wdGlvbnMudG9vbGtpdFxuICAgIHZhciB0aGVtZSA9IG9wdGlvbnMudGhlbWVcbiAgICBsb2d2KHZlcmJvc2UsJ0ZVTkNUSU9OIF9wcmVwYXJlRm9yQnVpbGQnKVxuICAgIGNvbnN0IHJpbXJhZiA9IHJlcXVpcmUoJ3JpbXJhZicpXG4gICAgY29uc3QgbWtkaXJwID0gcmVxdWlyZSgnbWtkaXJwJylcbiAgICBjb25zdCBmc3ggPSByZXF1aXJlKCdmcy1leHRyYScpXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIHRoZW1lID0gdGhlbWUgfHwgKHRvb2xraXQgPT09ICdjbGFzc2ljJyA/ICd0aGVtZS10cml0b24nIDogJ3RoZW1lLW1hdGVyaWFsJylcbiAgICBsb2d2KHZlcmJvc2UsJ2ZpcnN0VGltZTogJyArIHZhcnMuZmlyc3RUaW1lKVxuICAgIGlmICh2YXJzLmZpcnN0VGltZSkge1xuICAgICAgcmltcmFmLnN5bmMob3V0cHV0KVxuICAgICAgbWtkaXJwLnN5bmMob3V0cHV0KVxuICAgICAgY29uc3QgYnVpbGRYTUwgPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmJ1aWxkWE1MXG4gICAgICBjb25zdCBjcmVhdGVBcHBKc29uID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5jcmVhdGVBcHBKc29uXG4gICAgICBjb25zdCBjcmVhdGVXb3Jrc3BhY2VKc29uID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5jcmVhdGVXb3Jrc3BhY2VKc29uXG4gICAgICBjb25zdCBjcmVhdGVKU0RPTUVudmlyb25tZW50ID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5jcmVhdGVKU0RPTUVudmlyb25tZW50XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdidWlsZC54bWwnKSwgYnVpbGRYTUwodmFycy5wcm9kdWN0aW9uLCBvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdhcHAuanNvbicpLCBjcmVhdGVBcHBKc29uKHRoZW1lLCBwYWNrYWdlcywgdG9vbGtpdCwgb3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnanNkb20tZW52aXJvbm1lbnQuanMnKSwgY3JlYXRlSlNET01FbnZpcm9ubWVudChvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICd3b3Jrc3BhY2UuanNvbicpLCBjcmVhdGVXb3Jrc3BhY2VKc29uKG9wdGlvbnMsIG91dHB1dCksICd1dGY4JylcbiAgICAgIHZhciBmcmFtZXdvcmsgPSB2YXJzLmZyYW1ld29yaztcbiAgICAgIC8vYmVjYXVzZSBvZiBhIHByb2JsZW0gd2l0aCBjb2xvcnBpY2tlclxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksYGV4dC0ke2ZyYW1ld29ya30vdXgvYCkpKSB7XG4gICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBgZXh0LSR7ZnJhbWV3b3JrfS91eC9gKVxuICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgJ3V4JylcbiAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYXRoLCB0b1BhdGgpXG4gICAgICAgIGxvZyhhcHAsICdDb3B5aW5nICh1eCkgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgIH1cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLGBleHQtJHtmcmFtZXdvcmt9L3BhY2thZ2VzL2ApKSkge1xuICAgICAgICB2YXIgZnJvbVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgYGV4dC0ke2ZyYW1ld29ya30vcGFja2FnZXMvYClcbiAgICAgICAgdmFyIHRvUGF0aCA9IHBhdGguam9pbihvdXRwdXQsICdwYWNrYWdlcycpXG4gICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGF0aCwgdG9QYXRoKVxuICAgICAgICBsb2coYXBwLCAnQ29weWluZyAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgfVxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksYGV4dC0ke2ZyYW1ld29ya30vb3ZlcnJpZGVzL2ApKSkge1xuICAgICAgICB2YXIgZnJvbVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgYGV4dC0ke2ZyYW1ld29ya30vb3ZlcnJpZGVzL2ApXG4gICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCAnb3ZlcnJpZGVzJylcbiAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYXRoLCB0b1BhdGgpXG4gICAgICAgIGxvZyhhcHAsICdDb3B5aW5nICcgKyBmcm9tUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1BhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICB9XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzb3VyY2VzLycpKSkge1xuICAgICAgICB2YXIgZnJvbVJlc291cmNlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzb3VyY2VzLycpXG4gICAgICAgIHZhciB0b1Jlc291cmNlcyA9IHBhdGguam9pbihvdXRwdXQsICcuLi9yZXNvdXJjZXMnKVxuICAgICAgICBmc3guY29weVN5bmMoZnJvbVJlc291cmNlcywgdG9SZXNvdXJjZXMpXG4gICAgICAgIGxvZyhhcHAsICdDb3B5aW5nICcgKyBmcm9tUmVzb3VyY2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUmVzb3VyY2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgfVxuICAgIH1cbiAgICB2YXJzLmZpcnN0VGltZSA9IGZhbHNlXG4gICAgdmFyIGpzID0gJydcbiAgICBpZiAodmFycy5wcm9kdWN0aW9uKSB7XG4gICAgICB2YXJzLmRlcHMgPSB2YXJzLmRlcHMuZmlsdGVyKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCl7IHJldHVybiB2YXJzLmRlcHMuaW5kZXhPZih2YWx1ZSkgPT0gaW5kZXggfSk7XG4gICAgICBqcyA9IHZhcnMuZGVwcy5qb2luKCc7XFxuJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAganMgPSBgRXh0LnJlcXVpcmUoW1wiRXh0LipcIixcIkV4dC5kYXRhLlRyZWVTdG9yZVwiXSlgXG4gICAgfVxuICAgIGlmICh2YXJzLm1hbmlmZXN0ID09PSBudWxsIHx8IGpzICE9PSB2YXJzLm1hbmlmZXN0KSB7XG4gICAgICB2YXJzLm1hbmlmZXN0ID0ganMgKyAnO1xcbkV4dC5yZXF1aXJlKFtcIkV4dC5sYXlvdXQuKlwiXSk7XFxuJztcbiAgICAgIGNvbnN0IG1hbmlmZXN0ID0gcGF0aC5qb2luKG91dHB1dCwgJ21hbmlmZXN0LmpzJylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMobWFuaWZlc3QsIHZhcnMubWFuaWZlc3QsICd1dGY4JylcbiAgICAgIHZhcnMucmVidWlsZCA9IHRydWVcbiAgICAgIHZhciBidW5kbGVEaXIgPSBvdXRwdXQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJylcbiAgICAgIGlmIChidW5kbGVEaXIudHJpbSgpID09ICcnKSB7YnVuZGxlRGlyID0gJy4vJ31cbiAgICAgIGxvZyhhcHAsICdCdWlsZGluZyBFeHQgYnVuZGxlIGF0OiAnICsgYnVuZGxlRGlyKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhcnMucmVidWlsZCA9IGZhbHNlXG4gICAgICBsb2coYXBwLCAnRXh0IHJlYnVpbGQgTk9UIG5lZWRlZCcpXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMudmVyYm9zZSxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfcHJlcGFyZUZvckJ1aWxkOiAnICsgZSlcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIHZhcnMsIG9wdGlvbnMpIHtcbi8vICB0cnkge1xuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgbG9ndih2ZXJib3NlLCdGVU5DVElPTiBfYnVpbGRFeHRCdW5kbGUnKVxuICAgIGxldCBzZW5jaGE7IHRyeSB7IHNlbmNoYSA9IHJlcXVpcmUoJ0BzZW5jaGEvY21kJykgfSBjYXRjaCAoZSkgeyBzZW5jaGEgPSAnc2VuY2hhJyB9XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2VuY2hhKSkge1xuICAgICAgbG9ndih2ZXJib3NlLCdzZW5jaGEgZm9sZGVyIGV4aXN0cycpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9ndih2ZXJib3NlLCdzZW5jaGEgZm9sZGVyIERPRVMgTk9UIGV4aXN0JylcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IG9uQnVpbGREb25lID0gKCkgPT4ge1xuICAgICAgICBsb2d2KHZlcmJvc2UsJ29uQnVpbGREb25lJylcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgICB2YXIgb3B0cyA9IHsgY3dkOiBvdXRwdXRQYXRoLCBzaWxlbnQ6IHRydWUsIHN0ZGlvOiAncGlwZScsIGVuY29kaW5nOiAndXRmLTgnfVxuICAgICAgX2V4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKS50aGVuIChcbiAgICAgICAgZnVuY3Rpb24oKSB7IG9uQnVpbGREb25lKCkgfSxcbiAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7IHJlamVjdChyZWFzb24pIH1cbiAgICAgIClcbiAgICB9KVxuICAvLyB9XG4gIC8vIGNhdGNoKGUpIHtcbiAgLy8gICBjb25zb2xlLmxvZygnZScpXG4gIC8vICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLnZlcmJvc2UsZSlcbiAgLy8gICBjb21waWxhdGlvbi5lcnJvcnMucHVzaCgnX2J1aWxkRXh0QnVuZGxlOiAnICsgZSlcbiAgLy8gICBjYWxsYmFjaygpXG4gIC8vIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX2V4ZWN1dGVBc3luYyAoYXBwLCBjb21tYW5kLCBwYXJtcywgb3B0cywgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbi8vICB0cnkge1xuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgdmFyIGZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gICAgLy9jb25zdCBERUZBVUxUX1NVQlNUUlMgPSBbJ1tJTkZdIExvYWRpbmcnLCAnW0lORl0gUHJvY2Vzc2luZycsICdbTE9HXSBGYXNoaW9uIGJ1aWxkIGNvbXBsZXRlJywgJ1tFUlJdJywgJ1tXUk5dJywgXCJbSU5GXSBTZXJ2ZXJcIiwgXCJbSU5GXSBXcml0aW5nXCIsIFwiW0lORl0gTG9hZGluZyBCdWlsZFwiLCBcIltJTkZdIFdhaXRpbmdcIiwgXCJbTE9HXSBGYXNoaW9uIHdhaXRpbmdcIl07XG4gICAgY29uc3QgREVGQVVMVF9TVUJTVFJTID0gW1wiW0lORl0geFNlcnZlclwiLCAnW0lORl0gTG9hZGluZycsICdbSU5GXSBBcHBlbmQnLCAnW0lORl0gUHJvY2Vzc2luZycsICdbSU5GXSBQcm9jZXNzaW5nIEJ1aWxkJywgJ1tMT0ddIEZhc2hpb24gYnVpbGQgY29tcGxldGUnLCAnW0VSUl0nLCAnW1dSTl0nLCBcIltJTkZdIFdyaXRpbmdcIiwgXCJbSU5GXSBMb2FkaW5nIEJ1aWxkXCIsIFwiW0lORl0gV2FpdGluZ1wiLCBcIltMT0ddIEZhc2hpb24gd2FpdGluZ1wiXTtcbiAgICB2YXIgc3Vic3RyaW5ncyA9IERFRkFVTFRfU1VCU1RSU1xuICAgIHZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbiAgICBjb25zdCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24nKVxuICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9leGVjdXRlQXN5bmMnKVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxvZ3YodmVyYm9zZSxgY29tbWFuZCAtICR7Y29tbWFuZH1gKVxuICAgICAgbG9ndih2ZXJib3NlLCBgcGFybXMgLSAke3Bhcm1zfWApXG4gICAgICBsb2d2KHZlcmJvc2UsIGBvcHRzIC0gJHtKU09OLnN0cmluZ2lmeShvcHRzKX1gKVxuICAgICAgbGV0IGNoaWxkID0gY3Jvc3NTcGF3bihjb21tYW5kLCBwYXJtcywgb3B0cylcbiAgICAgIGNoaWxkLm9uKCdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgbG9ndih2ZXJib3NlLCBgb24gY2xvc2U6IGAgKyBjb2RlKVxuICAgICAgICBpZihjb2RlID09PSAwKSB7IHJlc29sdmUoMCkgfVxuICAgICAgICBlbHNlIHsgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goIG5ldyBFcnJvcihjb2RlKSApOyByZXNvbHZlKDApIH1cbiAgICAgIH0pXG4gICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgbG9ndih2ZXJib3NlLCBgb24gZXJyb3JgKVxuICAgICAgICBjb21waWxhdGlvbi5lcnJvcnMucHVzaChlcnJvcilcbiAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgfSlcbiAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgIHZhciBzdHIgPSBkYXRhLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyP1xcbnxcXHIvZywgXCIgXCIpLnRyaW0oKVxuICAgICAgICBsb2d2KHZlcmJvc2UsIGAke3N0cn1gKVxuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnRvU3RyaW5nKCkubWF0Y2goL0Zhc2hpb24gd2FpdGluZyBmb3IgY2hhbmdlc1xcLlxcLlxcLi8pKSB7XG5cbiAgICAgICAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgdmFyIGZpbGVuYW1lID0gcHJvY2Vzcy5jd2QoKSArIHZhcnMudG91Y2hGaWxlO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKVxuICAgICAgICAgICAgdmFyIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUpO1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlbmFtZSwgJy8vJyArIGQsICd1dGY4Jyk7XG4gICAgICAgICAgICBsb2d2KGFwcCwgYHRvdWNoaW5nICR7ZmlsZW5hbWV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGxvZ3YoYXBwLCBgTk9UIHRvdWNoaW5nICR7ZmlsZW5hbWV9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChzdWJzdHJpbmdzLnNvbWUoZnVuY3Rpb24odikgeyByZXR1cm4gZGF0YS5pbmRleE9mKHYpID49IDA7IH0pKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltJTkZdXCIsIFwiXCIpXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltMT0ddXCIsIFwiXCIpXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykudHJpbSgpXG4gICAgICAgICAgICBpZiAoc3RyLmluY2x1ZGVzKFwiW0VSUl1cIikpIHtcbiAgICAgICAgICAgICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goYXBwICsgc3RyLnJlcGxhY2UoL15cXFtFUlJcXF0gL2dpLCAnJykpO1xuICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltFUlJdXCIsIGAke2NoYWxrLnJlZChcIltFUlJdXCIpfWApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2coYXBwLCBzdHIpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgbG9ndihvcHRpb25zLCBgZXJyb3Igb24gY2xvc2U6IGAgKyBkYXRhKVxuICAgICAgICB2YXIgc3RyID0gZGF0YS50b1N0cmluZygpLnJlcGxhY2UoL1xccj9cXG58XFxyL2csIFwiIFwiKS50cmltKClcbiAgICAgICAgdmFyIHN0ckphdmFPcHRzID0gXCJQaWNrZWQgdXAgX0pBVkFfT1BUSU9OU1wiO1xuICAgICAgICB2YXIgaW5jbHVkZXMgPSBzdHIuaW5jbHVkZXMoc3RySmF2YU9wdHMpXG4gICAgICAgIGlmICghaW5jbHVkZXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHthcHB9ICR7Y2hhbGsucmVkKFwiW0VSUl1cIil9ICR7c3RyfWApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgLy8gfVxuICAvLyBjYXRjaChlKSB7XG4gIC8vICAgbG9ndihvcHRpb25zLGUpXG4gIC8vICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19leGVjdXRlQXN5bmM6ICcgKyBlKVxuICAvLyAgIGNhbGxiYWNrKClcbiAgLy8gfVxufVxuXG4vLyoqKioqKioqKipcbmZ1bmN0aW9uIHJ1blNjcmlwdChzY3JpcHRQYXRoLCBjYWxsYmFjaykge1xuICB2YXIgY2hpbGRQcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAvLyBrZWVwIHRyYWNrIG9mIHdoZXRoZXIgY2FsbGJhY2sgaGFzIGJlZW4gaW52b2tlZCB0byBwcmV2ZW50IG11bHRpcGxlIGludm9jYXRpb25zXG4gIHZhciBpbnZva2VkID0gZmFsc2U7XG4gIHZhciBwcm9jZXNzID0gY2hpbGRQcm9jZXNzLmZvcmsoc2NyaXB0UGF0aCk7XG4gIC8vIGxpc3RlbiBmb3IgZXJyb3JzIGFzIHRoZXkgbWF5IHByZXZlbnQgdGhlIGV4aXQgZXZlbnQgZnJvbSBmaXJpbmdcbiAgcHJvY2Vzcy5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGludm9rZWQpIHJldHVybjtcbiAgICBpbnZva2VkID0gdHJ1ZTtcbiAgICBjYWxsYmFjayhlcnIpO1xuICB9KTtcbiAgLy8gZXhlY3V0ZSB0aGUgY2FsbGJhY2sgb25jZSB0aGUgcHJvY2VzcyBoYXMgZmluaXNoZWQgcnVubmluZ1xuICBwcm9jZXNzLm9uKCdleGl0JywgZnVuY3Rpb24gKGNvZGUpIHtcbiAgICBpZiAoaW52b2tlZCkgcmV0dXJuO1xuICAgIGludm9rZWQgPSB0cnVlO1xuICAgIHZhciBlcnIgPSBjb2RlID09PSAwID8gbnVsbCA6IG5ldyBFcnJvcignZXhpdCBjb2RlICcgKyBjb2RlKTtcbiAgICBjYWxsYmFjayhlcnIpO1xuICB9KTtcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX3RvWHR5cGUoc3RyKSB7XG4gIHJldHVybiBzdHIudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9fL2csICctJylcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2dldEFwcCgpIHtcbiAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICB2YXIgcHJlZml4ID0gYGBcbiAgY29uc3QgcGxhdGZvcm0gPSByZXF1aXJlKCdvcycpLnBsYXRmb3JtKClcbiAgaWYgKHBsYXRmb3JtID09ICdkYXJ3aW4nKSB7IHByZWZpeCA9IGDihLkg772iZXh0772jOmAgfVxuICBlbHNlIHsgcHJlZml4ID0gYGkgW2V4dF06YCB9XG4gIHJldHVybiBgJHtjaGFsay5ncmVlbihwcmVmaXgpfSBgXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRWZXJzaW9ucyhwbHVnaW5OYW1lLCBmcmFtZXdvcmtOYW1lKSB7XG50cnkge1xuICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICB2YXIgdiA9IHt9XG4gIHZhciBmcmFtZXdvcmtJbmZvID0gJ24vYSdcblxuICB2LnBsdWdpblZlcnNpb24gPSAnbi9hJztcbiAgdi5leHRWZXJzaW9uID0gJ24vYSc7XG4gIHYuZWRpdGlvbiA9ICduL2EnO1xuICB2LmNtZFZlcnNpb24gPSAnbi9hJztcbiAgdi53ZWJwYWNrVmVyc2lvbiA9ICduL2EnO1xuXG4gIHZhciBwbHVnaW5QYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9Ac2VuY2hhJywgcGx1Z2luTmFtZSlcbiAgdmFyIHBsdWdpblBrZyA9IChmcy5leGlzdHNTeW5jKHBsdWdpblBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwbHVnaW5QYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5wbHVnaW5WZXJzaW9uID0gcGx1Z2luUGtnLnZlcnNpb25cbiAgdi5fcmVzb2x2ZWQgPSBwbHVnaW5Qa2cuX3Jlc29sdmVkXG4gIGlmICh2Ll9yZXNvbHZlZCA9PSB1bmRlZmluZWQpIHtcbiAgICB2LmVkaXRpb24gPSBgQ29tbWVyY2lhbGBcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoLTEgPT0gdi5fcmVzb2x2ZWQuaW5kZXhPZignY29tbXVuaXR5JykpIHtcbiAgICAgIHYuZWRpdGlvbiA9IGBDb21tZXJjaWFsYFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHYuZWRpdGlvbiA9IGBDb21tdW5pdHlgXG4gICAgfVxuICB9XG4gIHZhciB3ZWJwYWNrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvd2VicGFjaycpXG4gIHZhciB3ZWJwYWNrUGtnID0gKGZzLmV4aXN0c1N5bmMod2VicGFja1BhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh3ZWJwYWNrUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIHYud2VicGFja1ZlcnNpb24gPSB3ZWJwYWNrUGtnLnZlcnNpb25cbiAgdmFyIGV4dFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0JylcbiAgdmFyIGV4dFBrZyA9IChmcy5leGlzdHNTeW5jKGV4dFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhleHRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5leHRWZXJzaW9uID0gZXh0UGtnLnNlbmNoYS52ZXJzaW9uXG4gIHZhciBjbWRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksYG5vZGVfbW9kdWxlcy9Ac2VuY2hhL2NtZGApXG4gIHZhciBjbWRQa2cgPSAoZnMuZXhpc3RzU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIHYuY21kVmVyc2lvbiA9IGNtZFBrZy52ZXJzaW9uX2Z1bGxcbiAgaWYgKHYuY21kVmVyc2lvbiA9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgY21kUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLGBub2RlX21vZHVsZXMvQHNlbmNoYS8ke3BsdWdpbk5hbWV9L25vZGVfbW9kdWxlcy9Ac2VuY2hhL2NtZGApXG4gICAgdmFyIGNtZFBrZyA9IChmcy5leGlzdHNTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgICB2LmNtZFZlcnNpb24gPSBjbWRQa2cudmVyc2lvbl9mdWxsXG4gIH1cblxuICAgaWYgKGZyYW1ld29ya05hbWUgIT0gdW5kZWZpbmVkICYmIGZyYW1ld29ya05hbWUgIT0gJ2V4dGpzJykge1xuICAgIHZhciBmcmFtZXdvcmtQYXRoID0gJydcbiAgICBpZiAoZnJhbWV3b3JrTmFtZSA9PSAncmVhY3QnKSB7XG4gICAgICBmcmFtZXdvcmtQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9yZWFjdCcpXG4gICAgfVxuICAgIGlmIChmcmFtZXdvcmtOYW1lID09ICdhbmd1bGFyJykge1xuICAgICAgZnJhbWV3b3JrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY29yZScpXG4gICAgfVxuICAgIHZhciBmcmFtZXdvcmtQa2cgPSAoZnMuZXhpc3RzU3luYyhmcmFtZXdvcmtQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZnJhbWV3b3JrUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gICAgdi5mcmFtZXdvcmtWZXJzaW9uID0gZnJhbWV3b3JrUGtnLnZlcnNpb25cbiAgICBpZiAodi5mcmFtZXdvcmtWZXJzaW9uID09IHVuZGVmaW5lZCkge1xuICAgICAgZnJhbWV3b3JrSW5mbyA9ICcsICcgKyBmcmFtZXdvcmtOYW1lXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZnJhbWV3b3JrSW5mbyA9ICcsICcgKyBmcmFtZXdvcmtOYW1lICsgJyB2JyArIHYuZnJhbWV3b3JrVmVyc2lvblxuICAgIH1cbiAgfVxuICByZXR1cm4gJ2V4dC13ZWJwYWNrLXBsdWdpbiB2JyArIHYucGx1Z2luVmVyc2lvbiArICcsIEV4dCBKUyB2JyArIHYuZXh0VmVyc2lvbiArICcgJyArIHYuZWRpdGlvbiArICcgRWRpdGlvbiwgU2VuY2hhIENtZCB2JyArIHYuY21kVmVyc2lvbiArICcsIHdlYnBhY2sgdicgKyB2LndlYnBhY2tWZXJzaW9uICsgZnJhbWV3b3JrSW5mb1xuXG59XG5jYXRjaCAoZSkge1xuICByZXR1cm4gJ2V4dC13ZWJwYWNrLXBsdWdpbiB2JyArIHYucGx1Z2luVmVyc2lvbiArICcsIEV4dCBKUyB2JyArIHYuZXh0VmVyc2lvbiArICcgJyArIHYuZWRpdGlvbiArICcgRWRpdGlvbiwgU2VuY2hhIENtZCB2JyArIHYuY21kVmVyc2lvbiArICcsIHdlYnBhY2sgdicgKyB2LndlYnBhY2tWZXJzaW9uICsgZnJhbWV3b3JrSW5mb1xufVxuXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIGxvZyhhcHAsbWVzc2FnZSkge1xuICB2YXIgcyA9IGFwcCArIG1lc3NhZ2VcbiAgcmVxdWlyZSgncmVhZGxpbmUnKS5jdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMClcbiAgdHJ5IHtwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKX1jYXRjaChlKSB7fVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKTtwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gbG9naChhcHAsbWVzc2FnZSkge1xuICB2YXIgaCA9IGZhbHNlXG4gIHZhciBzID0gYXBwICsgbWVzc2FnZVxuICBpZiAoaCA9PSB0cnVlKSB7XG4gICAgcmVxdWlyZSgncmVhZGxpbmUnKS5jdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMClcbiAgICB0cnkge1xuICAgICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgICB9XG4gICAgY2F0Y2goZSkge31cbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKVxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIGxvZ3YodmVyYm9zZSwgcykge1xuICBpZiAodmVyYm9zZSA9PSAneWVzJykge1xuICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgdHJ5IHtcbiAgICAgIHByb2Nlc3Muc3Rkb3V0LmNsZWFyTGluZSgpXG4gICAgfVxuICAgIGNhdGNoKGUpIHt9XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYC12ZXJib3NlOiAke3N9YClcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbiAgfVxufVxuXG5mdW5jdGlvbiBfZ2V0VmFsaWRhdGVPcHRpb25zKCkge1xuICByZXR1cm4ge1xuICAgIFwidHlwZVwiOiBcIm9iamVjdFwiLFxuICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICBcImZyYW1ld29ya1wiOiB7XG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcInRvb2xraXRcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJ0aGVtZVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcImVtaXRcIjoge1xuICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcInNjcmlwdFwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcInBvcnRcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wiaW50ZWdlclwiXVxuICAgICAgfSxcbiAgICAgIFwicGFja2FnZXNcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCIsIFwiYXJyYXlcIl1cbiAgICAgIH0sXG4gICAgICBcInByb2ZpbGVcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJlbnZpcm9ubWVudFwiOiB7XG4gICAgICAgIFwiZXJyb3JNZXNzYWdlXCI6IFwic2hvdWxkIGJlICdkZXZlbG9wbWVudCcgb3IgJ3Byb2R1Y3Rpb24nIHN0cmluZyB2YWx1ZVwiLFxuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJ0cmVlc2hha2VcIjoge1xuICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcImJyb3dzZXJcIjoge1xuICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcIndhdGNoXCI6IHtcbiAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJ2ZXJib3NlXCI6IHtcbiAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJpbmplY3RcIjoge1xuICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAneWVzJyBvciAnbm8nIHN0cmluZyB2YWx1ZSAoTk9UIHRydWUgb3IgZmFsc2UpXCIsXG4gICAgICAgIFwidHlwZVwiOiBbXCJzdHJpbmdcIl1cbiAgICAgIH0sXG4gICAgICBcImludGVsbGlzaGFrZVwiOiB7XG4gICAgICAgIFwiZXJyb3JNZXNzYWdlXCI6IFwic2hvdWxkIGJlICd5ZXMnIG9yICdubycgc3RyaW5nIHZhbHVlIChOT1QgdHJ1ZSBvciBmYWxzZSlcIixcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgfSxcbiAgICB9LFxuICAgIFwiYWRkaXRpb25hbFByb3BlcnRpZXNcIjogZmFsc2VcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0RGVmYXVsdE9wdGlvbnMoKSB7XG4gIHJldHVybiB7XG4gICAgZnJhbWV3b3JrOiAnZXh0anMnLFxuICAgIHRvb2xraXQ6ICdtb2Rlcm4nLFxuICAgIHRoZW1lOiAndGhlbWUtbWF0ZXJpYWwnLFxuICAgIGVtaXQ6ICd5ZXMnLFxuICAgIHNjcmlwdDogbnVsbCxcbiAgICBwb3J0OiAxOTYyLFxuICAgIHBhY2thZ2VzOiBbXSxcblxuICAgIHByb2ZpbGU6ICcnLFxuICAgIGVudmlyb25tZW50OiAnZGV2ZWxvcG1lbnQnLFxuICAgIHRyZWVzaGFrZTogJ25vJyxcbiAgICBicm93c2VyOiAneWVzJyxcbiAgICB3YXRjaDogJ3llcycsXG4gICAgdmVyYm9zZTogJ25vJyxcbiAgICBpbmplY3Q6ICd5ZXMnLFxuICAgIGludGVsbGlzaGFrZTogJ3llcydcbiAgfVxufVxuIl19