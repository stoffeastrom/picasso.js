import {
  getSliceRect,
  slices
} from '../../../../../../src/core/chart-components/labels/strategies/slices';

describe('labeling - slices', () => {
  describe('slice rects', () => {
    it('inside Q1 - OK', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: 0,
          end: 2 * Math.asin(4 / 5),
          innerRadius: 0,
          outerRadius: 15
        },
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: 5,
        y: -8,
        width: 6,
        height: 4,
        baseline: 'top'
      });
    });

    it('inside Q2 - OK', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: Math.PI / 2,
          end: (Math.PI / 2) + (2 * Math.asin(3 / 5)),
          innerRadius: 0,
          outerRadius: 15
        },
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: 5,
        y: 4,
        width: 6,
        height: 4,
        baseline: 'top'
      });
    });

    it('opposite Q3 - OK', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: Math.PI,
          end: Math.PI + (2 * Math.asin(4 / 5)),
          innerRadius: 15,
          outerRadius: 20
        },
        position: 'inside',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql({
        x: -11,
        y: 4,
        width: 6,
        height: 4,
        baseline: 'top'
      });
    });

    it('inside Q4 - Do not fit', () => {
      expect(getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: (Math.PI * (3 / 2)) + Math.asin(3 / 5),
          end: (Math.PI * (3 / 2)) + Math.asin(3 / 5),
          innerRadius: 0,
          outerRadius: 15
        },
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 }
      })).to.eql(null);
    });

    it('rotated outside', () => {
      let epsilon = 0.0001;
      let bounds = getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: 0,
          end: Math.PI,
          innerRadius: 15,
          outerRadius: 20
        },
        direction: 'rotate',
        position: 'outside',
        padding: 1,
        measured: { width: 6, height: 4 },
        view: { x: -50, y: -50, width: 100, height: 100 }
      });
      expect(bounds).property('anchor').to.equal('start');
      expect(bounds).property('angle').to.equal(0);
      expect(bounds).property('x').to.equal(21);
      expect(bounds).property('y').to.closeTo(0, epsilon);
      expect(bounds).property('width').to.equal(6);
      expect(bounds).property('height').to.equal(4);
    });

    it('rotated into', () => {
      let epsilon = 0.0001;
      let bounds = getSliceRect({
        slice: {
          offset: { x: 0, y: 0 },
          start: 0,
          end: Math.PI,
          innerRadius: 15,
          outerRadius: 20
        },
        direction: 'rotate',
        position: 'into',
        padding: 1,
        measured: { width: 6, height: 4 },
        view: { x: -50, y: -50, width: 100, height: 100 }
      });
      expect(bounds).property('anchor').to.equal('end');
      expect(bounds).property('angle').to.equal(0);
      expect(bounds).property('x').to.equal(19);
      expect(bounds).property('y').to.closeTo(0, epsilon);
      expect(bounds).property('width').to.equal(3);
      expect(bounds).property('height').to.equal(4);
    });
  });

  describe('slice strategy', () => {
    let chart;
    let renderer;
    beforeEach(() => {
      chart = {};
      renderer = {
        measureText: sinon.stub()
      };
    });

    it('should return some labels', () => {
      const settings = {
        direction: () => 'vertical',
        labels: [{
          placements: [{ position: 'into', fill: () => 'red' }],
          label: () => 'etikett'
        }]
      };
      const nodes = [{
        desc: {
          slice: {
            offset: { x: 25, y: 25 },
            start: 0,
            end: 2 * Math.PI,
            innerRadius: 0,
            outerRadius: 50
          }
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = slices({
        settings,
        chart,
        nodes,
        renderer,
        style: {
          label: {
            fontSize: '16px',
            fontFamily: 'simpsons',
            fill: 'green'
          }
        }
      });

      expect(labels[0]).to.eql({
        type: 'text',
        text: 'etikett',
        maxWidth: 20,
        x: 15,
        y: 64,
        fill: 'red',
        anchor: 'start',
        baseline: 'middle',
        fontSize: '16px',
        fontFamily: 'simpsons'
      });
    });

    it('should skip node if label is falsy', () => {
      const settings = {
        direction: () => 'right',
        labels: [{
          placements: [{ position: 'into', fill: () => 'red' }],
          label: () => ''
        }]
      };
      const nodes = [{
        desc: {
          slice: {
            offset: { x: 25, y: 25 },
            start: 0,
            end: 2 * Math.PI,
            innerRadius: 0,
            outerRadius: 50
          }
        }
      }];
      renderer.measureText.returns({ width: 20, height: 10 });
      let labels = slices({
        settings,
        chart,
        nodes,
        renderer,
        style: {
          label: {
            fontSize: '16px',
            fontFamily: 'simpsons',
            fill: 'yellow'
          }
        }
      });

      expect(labels).to.be.empty;
    });

    describe('label overlap', () => {
      function testLabelCount(count, list) {
        const settings = {
          direction: () => 'vertical',
          labels: [{
            placements: [{ position: 'outside', fill: () => 'red' }],
            label: () => 'etikett'
          }]
        };
        const nodes = list.map(l => ({
          desc: {
            slice: {
              offset: { x: 25, y: 25 },
              start: l.start,
              end: l.end,
              innerRadius: 0,
              outerRadius: 50
            }
          }
        }));

        renderer.measureText.returns({ width: 20, height: 10 });
        let labels = slices({
          settings,
          chart,
          nodes,
          renderer,
          rect: { x: 0, y: 0, height: 50, width: 50 },
          style: {
            label: {
              fontSize: '16px',
              fontFamily: 'simpsons',
              fill: 'green'
            }
          }
        });

        expect(labels.length).to.eql(count);
      }
      it('should remove overlapping labels', () => {
        testLabelCount(1, [
          { start: 0, end: 0.1 },
          { start: 0.1, end: 0.2 }
        ]);
      });

      it('should keep not overlapping labels', () => {
        testLabelCount(2, [
          { start: 0, end: Math.PI / 2 },
          { start: Math.PI / 2, end: Math.PI }
        ]);
      });

      it('labels on different side should not overlap', () => {
        testLabelCount(2, [
          { start: -0.1, end: 0 },
          { start: 0, end: 0.1 }
        ]);
      });
    });
  });
});
