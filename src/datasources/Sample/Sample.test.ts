import Sample from './Sample';

let { expect } = chai;

describe('Sample', () => {
  let sampleDataSource = new Sample();
  it('get data from Sample datasource', () => {
    expect(sampleDataSource.getData()).to.equal('Sample');
  });
});
