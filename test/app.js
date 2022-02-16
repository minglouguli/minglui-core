import page from './page';
export default {
  name: 'app',
  data() {
    return {
      title: 'test app'
    };
  },
  template: `<div id="app">
    hello world!
  </div>`,
  render(h) {
    return h('div', {
      attrs: {
        id: 'app'
      },
      render: h => {
        return h(page);
      }
    });
  },
  async script() {
    console.log('run App');
    this.$ml.log('hello minglsum!');
    this.$go('@test3')
      .success(data => {
        console.log('111', data);
      })
      .error((msg, code, data, origin) => {
        console.log('eee', msg, code, data, origin);
      });

    let flag = await this.$identity.authenticate({ page: 'home' });
    if (!flag) {
      this.$identity.signOut();
    }
  },
  style: {
    'mss-color': {
      color: 'red'
    }
  }
};
