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
    let template = `
    <a>\\{\\{ {{name}} \\}\\}</a>
    <b>{{description}}</b>
    <b>\\{\\{description\\}\\}</b>
    <b>{{description}}</b>
    `;
    //  let template = 'P{{show==1}}';
    let templateData = {
      name: 'Template',
      fullName: 'JiuRu.Hdk.DuoKe.Entities.PackageTemplates.Template',
      description: '礼包模板',
      group: 'PackageTemplate',
      isMain: true,
      nullchat: '?',
      properties: [
        {
          name: 'Id',
          typeName: 'long',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '编号',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'Title',
          typeName: 'string',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '模板标题',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'Subtitle',
          typeName: 'string',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '副标',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'Width',
          typeName: 'int',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '宽度',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'Height',
          typeName: 'int',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '高度',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'ImageFileId',
          typeName: 'Nullable`1',
          nullable: true,
          genericTypeName: 'long',
          isEnum: false,
          isGenericType: true,
          isInterface: false,
          isVirtual: false,
          description: '封面图片编号',
          isFile: true,
          filePath: 'ImageFilePath',
          fileTable: 'ImageFile',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'Introduction',
          typeName: 'string',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '描述',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'OriginalPrice',
          typeName: 'int',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '原价',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'Price',
          typeName: 'int',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '售价',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'CreateTime',
          typeName: 'DateTime',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: false,
          description: '添加日期',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'ContentTextId',
          typeName: 'Nullable`1',
          nullable: true,
          genericTypeName: 'long',
          isEnum: false,
          isGenericType: true,
          isInterface: false,
          isVirtual: false,
          description: '模板富文本编号',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: true,
          text: 'ContentTextContent',
          textTable: 'ContentText'
        },
        {
          name: 'DeleteTime',
          typeName: 'Nullable`1',
          nullable: true,
          genericTypeName: 'DateTime',
          isEnum: false,
          isGenericType: true,
          isInterface: false,
          isVirtual: false,
          description: '删除时间',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'TemplateTagItems',
          typeName: 'List`1',
          nullable: false,
          genericTypeName: 'TemplateTagItem',
          isEnum: false,
          isGenericType: true,
          isInterface: false,
          isVirtual: true,
          description: '模板标签',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'ImageFile',
          typeName: 'CloudFile',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: true,
          description: '封面图片',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        },
        {
          name: 'ContentText',
          typeName: 'Text',
          nullable: false,
          genericTypeName: '',
          isEnum: false,
          isGenericType: false,
          isInterface: false,
          isVirtual: true,
          description: '',
          isFile: false,
          filePath: '',
          fileTable: '',
          isText: false,
          text: '',
          textTable: ''
        }
      ]
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
