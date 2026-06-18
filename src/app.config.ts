export default defineAppConfig({
  pages: [
    'pages/report/index',
    'pages/observe/index',
    'pages/feedback/index',
    'pages/clue-detail/index',
    'pages/topic-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '校园舆情监测',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/report/index',
        text: '线索上报'
      },
      {
        pagePath: 'pages/observe/index',
        text: '话题观察'
      },
      {
        pagePath: 'pages/feedback/index',
        text: '协同反馈'
      }
    ]
  }
})
