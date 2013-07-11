function synth (ctx) {
  this.ctx = ctx;
  this.out = ctx.createGain();
  
  this.layers = [];
  this.buildLayers(8);
}

synth.prototype.buildLayers = function (num) {
  for (var i = 0; i < num; i++) {
    var melody = ctx.createOscillator();
    melody.type = 3;
    melody.connect(gain);
    
    var bass = ctx.createOscillator();
    bass.type = 3;
    bass.connect(gain);
    
    var lead = ctx.createOscillator();
    lead.type = 2;
    lead.connect(gain);
    
    var mixer = ctx.createGain();
    mixer.gain.value = 0.0;
    mixer.connect(this.out);
    
    this.layers.push({
      free : true,
      frequency : 0,
      mixer : mixer,
      melody : melody,
      bass : bass,
      lead : lead
    })
  }
}

synth.prototype.noteOn = function (note, at, opts) {
  var frequency = note.frequency;
  
  var layer = this.getLayer();
  if (!layer) return;
  
  layer.free = false;
  layer.frequency = frequency;
  
  layer.melody.frequency.value = frequency * 1;
  layer.melody.detune.value = -10;
  layer.bass.frequency.value = frequency * 1/4;
  layer.lead.frequency.value = frequency * 2;
  layer.lead.detune.value = 10;

  layer.melody.noteOn(at);
  layer.bass.noteOn(at);
  layer.lead.noteOn(at);

  setVelocity({ node : layer.mixer, velocity : opts.velocity, at : at });
};

synth.prototype.noteMod = function (note, at, opts) {
  // find layer
  var layer = this.getLayer(note);
  if (!layer) return;
  
  if ('velocity' in opts) {
    setVelocity({ node : layer.mixer, velocity : opts.velocity, at : at });
  }
}

synth.prototype.noteOff = function (note, at) {
  var frequency = note.frequency;
  
  var layer = this.getLayer(note);
  if (!layer) return;
  
  layer.free = true;
  layer.mixer.gain.cancelScheduledValues(at);
  layer.mixer.gain.setValueAtTime(layer.mixer.gain.value, at);
  layer.mixer.gain.setTargetValueAtTime(0.0, at, 0.1);
}

/**
 * @param {Note} note
 *
 * @api private
 */

synth.prototype.getLayer = function (note) {
  return layers.filter(function (layer) {
    if (note) return !layer.free && layer.frequency = note.frequency
    return layer.free
  })[0]
}

/**
 * @param {Number} opts.at
 * @param {Number} opts.velocity
 * @param {AudioNode} opts.node
 *
 * @api private
 */

function setVelocity (opts) {
  opts.node.gain.cancelScheduledValues(opts.at);
  opts.node.gain.setValueAtTime(opts.velocity, opts.at);
  opts.node.gain.setTargetValueAtTime(0.5, opts.at, 0.01);
}