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
    let template = `uuuuuuuuuuu---{{title}}====
    for:
    {{@for item1,index in list
       序号：{{index}}--值：{{item1.name}}---
       the age is {{item1.info.age}}
    }}0000
    =======================
     if:===========
     {{@if show==1
     === {{yesMsg}}
    }}iiii
    {{@else if show==2
     ==== {{noMsg}}
    }}
    {{@else
     === {{show}}
    }}===
    ===abc
   
   
    ====`;
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
    let renderContent = this.$ml.MlR().new().newRender(template, templateData);

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
