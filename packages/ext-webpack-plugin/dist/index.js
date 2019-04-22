'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require('@babel/polyfill');

const pluginUtil = require(`./pluginUtil`);

class ExtWebpackPlugin {
  constructor(options) {
    var constructorOutput = pluginUtil._constructor(options);

    this.vars = constructorOutput.vars;
    this.options = constructorOutput.options;
    pluginUtil.logv('yes', 'VARS');
    pluginUtil.logv('yes', JSON.stringify(this.vars));
    pluginUtil.logv('yes', 'OPTIONS');
    pluginUtil.logv('yes', JSON.stringify(this.options));
  }

  apply(compiler) {
    const vars = this.vars;
    const options = this.options;
    const app = this.app;

    if (!compiler.hooks) {
      console.log('not webpack 4');
      return;
    }

    compiler.hooks.thisCompilation.tap(`ext-this-compilation`, compilation => {
      pluginUtil.logh(app, `HOOK thisCompilation`);

      pluginUtil._thisCompilation(compiler, compilation, vars, options);

      if (vars.pluginErrors.length > 0) {
        compilation.errors.push(new Error(vars.pluginErrors.join("")));
        return;
      }
    });
    compiler.hooks.compilation.tap(`ext-compilation`, compilation => {
      pluginUtil.logh(app, `HOOK compilation`);

      pluginUtil._compilation(compiler, compilation, vars, options);
    });
    compiler.hooks.afterCompile.tap('ext-after-compile', compilation => {
      pluginUtil.logh(app, `HOOK afterCompile`);

      pluginUtil._afterCompile(compiler, compilation, vars, options);
    });
    compiler.hooks.emit.tapAsync(`ext-emit`, (compilation, callback) => {
      pluginUtil.logh(app, `HOOK emit (async)`);

      pluginUtil._emit(compiler, compilation, vars, options, callback);
    });
    compiler.hooks.done.tap(`ext-done`, stats => {
      pluginUtil.logh(app, `HOOK done`);

      pluginUtil._done(stats, vars, options);
    });
  }

}

exports.default = ExtWebpackPlugin;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwicGx1Z2luVXRpbCIsIkV4dFdlYnBhY2tQbHVnaW4iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJjb25zdHJ1Y3Rvck91dHB1dCIsIl9jb25zdHJ1Y3RvciIsInZhcnMiLCJsb2d2IiwiSlNPTiIsInN0cmluZ2lmeSIsImFwcGx5IiwiY29tcGlsZXIiLCJhcHAiLCJob29rcyIsImNvbnNvbGUiLCJsb2ciLCJ0aGlzQ29tcGlsYXRpb24iLCJ0YXAiLCJjb21waWxhdGlvbiIsImxvZ2giLCJfdGhpc0NvbXBpbGF0aW9uIiwicGx1Z2luRXJyb3JzIiwibGVuZ3RoIiwiZXJyb3JzIiwicHVzaCIsIkVycm9yIiwiam9pbiIsIl9jb21waWxhdGlvbiIsImFmdGVyQ29tcGlsZSIsIl9hZnRlckNvbXBpbGUiLCJlbWl0IiwidGFwQXN5bmMiLCJjYWxsYmFjayIsIl9lbWl0IiwiZG9uZSIsInN0YXRzIiwiX2RvbmUiXSwibWFwcGluZ3MiOiJBQUNBOzs7Ozs7O0FBQ0FBLE9BQU8sQ0FBQyxpQkFBRCxDQUFQOztBQUNBLE1BQU1DLFVBQVUsR0FBR0QsT0FBTyxDQUFFLGNBQUYsQ0FBMUI7O0FBRWUsTUFBTUUsZ0JBQU4sQ0FBdUI7QUFFcENDLEVBQUFBLFdBQVcsQ0FBQ0MsT0FBRCxFQUFVO0FBQ25CLFFBQUlDLGlCQUFpQixHQUFHSixVQUFVLENBQUNLLFlBQVgsQ0FBd0JGLE9BQXhCLENBQXhCOztBQUNBLFNBQUtHLElBQUwsR0FBWUYsaUJBQWlCLENBQUNFLElBQTlCO0FBQ0EsU0FBS0gsT0FBTCxHQUFlQyxpQkFBaUIsQ0FBQ0QsT0FBakM7QUFFQUgsSUFBQUEsVUFBVSxDQUFDTyxJQUFYLENBQWdCLEtBQWhCLEVBQXVCLE1BQXZCO0FBQ0FQLElBQUFBLFVBQVUsQ0FBQ08sSUFBWCxDQUFnQixLQUFoQixFQUF1QkMsSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS0gsSUFBcEIsQ0FBdkI7QUFFQU4s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bGwnKVxuY29uc3QgcGx1Z2luVXRpbCA9IHJlcXVpcmUoYC4vcGx1Z2luVXRpbGApXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4dFdlYnBhY2tQbHVnaW4ge1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgY29uc3RydWN0b3JPdXRwdXQgPSBwbHVnaW5VdGlsLl9jb25zdHJ1Y3RvcihvcHRpb25zKVxuICAgIHRoaXMudmFycyA9IGNvbnN0cnVjdG9yT3V0cHV0LnZhcnNcbiAgICB0aGlzLm9wdGlvbnMgPSBjb25zdHJ1Y3Rvck91dHB1dC5vcHRpb25zXG5cbiAgICBwbHVnaW5VdGlsLmxvZ3YoJ3llcycsICdWQVJTJyk7XG4gICAgcGx1Z2luVXRpbC5sb2d2KCd5ZXMnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnZhcnMpKTtcblxuICAgIHBsdWdpblV0aWwubG9ndigneWVzJywgJ09QVElPTlMnKTtcbiAgICBwbHVnaW5VdGlsLmxvZ3YoJ3llcycsIEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucykpO1xuICB9XG5cbiAgYXBwbHkoY29tcGlsZXIpIHtcbiAgICBjb25zdCB2YXJzID0gdGhpcy52YXJzXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwXG5cbiAgICBpZiAoIWNvbXBpbGVyLmhvb2tzKSB7XG4gICAgICBjb25zb2xlLmxvZygnbm90IHdlYnBhY2sgNCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbXBpbGVyLmhvb2tzLnRoaXNDb21waWxhdGlvbi50YXAoYGV4dC10aGlzLWNvbXBpbGF0aW9uYCwgKGNvbXBpbGF0aW9uKSA9PiB7XG4gICAgICBwbHVnaW5VdGlsLmxvZ2goYXBwLCBgSE9PSyB0aGlzQ29tcGlsYXRpb25gKVxuICAgICAgcGx1Z2luVXRpbC5fdGhpc0NvbXBpbGF0aW9uKGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucylcblxuICAgICAgaWYgKHZhcnMucGx1Z2luRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goIG5ldyBFcnJvcih2YXJzLnBsdWdpbkVycm9ycy5qb2luKFwiXCIpKSApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb21waWxlci5ob29rcy5jb21waWxhdGlvbi50YXAoYGV4dC1jb21waWxhdGlvbmAsIChjb21waWxhdGlvbikgPT4ge1xuICAgICAgcGx1Z2luVXRpbC5sb2doKGFwcCwgYEhPT0sgY29tcGlsYXRpb25gKVxuICAgICAgcGx1Z2luVXRpbC5fY29tcGlsYXRpb24oY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKVxuICAgIH0pXG5cbiAgICBjb21waWxlci5ob29rcy5hZnRlckNvbXBpbGUudGFwKCdleHQtYWZ0ZXItY29tcGlsZScsIChjb21waWxhdGlvbikgPT4ge1xuICAgICAgcGx1Z2luVXRpbC5sb2doKGFwcCwgYEhPT0sgYWZ0ZXJDb21waWxlYClcbiAgICAgIHBsdWdpblV0aWwuX2FmdGVyQ29tcGlsZShjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpXG4gICAgfSlcblxuICAgIGNvbXBpbGVyLmhvb2tzLmVtaXQudGFwQXN5bmMoYGV4dC1lbWl0YCwgKGNvbXBpbGF0aW9uLCBjYWxsYmFjaykgPT4ge1xuICAgICAgcGx1Z2luVXRpbC5sb2doKGFwcCwgYEhPT0sgZW1pdCAoYXN5bmMpYClcbiAgICAgIHBsdWdpblV0aWwuX2VtaXQoY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICB9KVxuXG4gICAgY29tcGlsZXIuaG9va3MuZG9uZS50YXAoYGV4dC1kb25lYCwgKHN0YXRzKSA9PiB7XG4gICAgICBwbHVnaW5VdGlsLmxvZ2goYXBwLCBgSE9PSyBkb25lYClcbiAgICAgIHBsdWdpblV0aWwuX2RvbmUoc3RhdHMsIHZhcnMsIG9wdGlvbnMpXG4gICAgfSlcbiAgfVxufVxuIl19