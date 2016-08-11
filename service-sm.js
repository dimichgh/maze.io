'use strict';

require('seneca')()
  .use('mesh', {
      base:true,
      model: 'actor'
  });

function color() {
  this.add( 'color:red', function(args,done){
    done(null, {hex:'#FF0000'});
  })
}

var seneca = require('seneca')

seneca()
.use('mesh', {
    auto:true,
    pin:'color:red'
})
.use(color)


seneca()
.use('mesh', {
  auto:true
})
.ready(function () {
  setTimeout(() => {
      this.act('color:red', console.log);
  }, 3000);
});
