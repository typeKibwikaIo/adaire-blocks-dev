const babel = require('@babel/core');
const code = `
const Foo = () => {
  return (
    <>
      <div className="test">
        <span>hi</span>
      </div>
    </>
  );
};
export default Foo;
`;
try {
  babel.transformSync(code, {
    filename: 'test.js',
    presets: [require.resolve('@wordpress/babel-preset-default')],
    babelrc: false,
    configFile: false,
  });
  console.log('MINI OK');
} catch (e) {
  console.log('MINI ERROR: ' + e.message);
}
