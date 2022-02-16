export default {
  name: 'page',
  data() {
    return {
      title: 'test app'
    };
  },
  template: `<div>
    page 1
  </div>`,
  render(h) {
    return h('div', {
      attrs: {
        id: 'app'
      }
    });
  },
  script() {
    console.log('run Page');
  },
  style: {
    'mss-color': {
      color: 'red'
    }
  }
};
