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
    //this.methods.test1();
    console.log('888888', this.$ml);
    let template = `uuuuuuuuuuu---{{title+'abc'|todo|at}}====
    for:0000
    {{@for item1,index in list
       序号：{{index}}--值：{{item1.name|todo}}---
       the age is {{item1.info.age}}
    }}
    =======================
     if:===========
     {{@if show==1
     === {{yesMsg}}{{show==1?"aa":'s'|todo}}
    }}
    {{@else if show==2
    ====2 {{noMsg}}
    }}
    {{@else
     ===1 {{show}}
    }}
    ===abc
     ooooo
    ====`;
    //  let template = 'P{{show==1}}';
    let templateData = {
      title: 'hello world!',
      list: [
        {
          name: 'item1-name',
          info: {
            age: 1
          }
        },
        {
          name: 'item2-name'
        }
      ],
      show: 1,
      yesMsg: 'yes',
      noMsg: 'no'
    };
    let render = this.$ml.MlR().new();
    render.filter('todo', v => {
      return v + '123';
    });
    render.filter('at', v => {
      return v + '@';
    });
    let renderContent = render.renderX(template, templateData);

    let pre = document.createElement('pre');
    pre.innerText = template;
    console.log(renderContent);
    document.querySelector('#app').append(pre); //.innerText = renderContent;
  },
  methods: {
    test2() {
      console.log('ssss22222222222');
    },
    async test1() {
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
    }
  },
  style: {
    'mss-color': {
      color: 'red'
    }
  }
};
