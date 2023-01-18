(function() {
  function setup () {
    var settings = require('Storage').readJSON('hourstrike.json',1);
    var t = new Date();
    var t_min_sec = t.getMinutes()*60+t.getSeconds();
    var wait_msec = settings.interval>0?(settings.interval-t_min_sec%settings.interval)*1000:-1;
    if (wait_msec>0) {
      t.setMilliseconds(t.getMilliseconds()+wait_msec);
      var t_hour = t.getHours();
      if (t_hour<settings.start||t_hour>settings.end) {
        var strike = new Date(t.getTime());
        strike.setHours(settings.start);
        strike.setMinutes(0);
        if (t_hour>settings.end) {
          strike.setDate(strike.getDate()+1);
        }
        wait_msec += strike-t;
        settings.next_hour = strike.getHours();
        settings.next_minute = strike.getMinutes();
      } else {
        settings.next_hour = t_hour;
        settings.next_minute = t.getMinutes();
      }
      if (settings.offset > 0) {
        var wait_offset_msec = wait_msec - (settings.offset * 60) * 1000;
        setTimeout(strike_offset_func, wait_offset_msec);
      }
      setTimeout(strike_base_func, wait_msec);
    } else {
      settings.next_hour = -1;
      settings.next_minute = -1;
    }
    require('Storage').write('hourstrike.json', settings);
  }
  function strike_func (count, buzzOrBeep) {
    if (0 == buzzOrBeep) {
      vibrateDigitBuzz(count);
    } else {
      vibrateDigitBeep(count);
    }
  }

  /* from vectorclock */
  function vibrateDigitBuzz(num) {
    if (num==0) return Bangle.buzz(200, setting.vlevel|| 0.5);
    return new Promise(function f(resolve){
      if (num--<=0) return resolve();
      Bangle.buzz(100, setting.vlevel || 0.5).then(()=>{
        setTimeout(()=>f(resolve), 200);
      });
    });
  }
  function vibrateDigitBeep(num) {
    if (num==0) return Bangle.beep(200);
    return new Promise(function f(resolve){
      if (num--<=0) return resolve();
      Bangle.beep(100).then(()=>{
        setTimeout(()=>f(resolve), 200);
      });
    });
  }

  function strike_base_func () {
    var setting = require('Storage').readJSON('hourstrike.json',1)||[];
    strike_func(setting.scount || 0, setting.buzzOrBeep || 0);
    setup();
  }
  function strike_offset_func () {
    var setting = require('Storage').readJSON('hourstrike.json',1)||[];
    strike_func(setting.offset_scount || 0, setting.buzzOrBeep || 0);
  }
  setup();
})();
