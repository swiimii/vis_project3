class Wordmap {
	constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 15, bottom: 50, right: 10, left: 50 }
    }

    this.data = _data;

    // Call a class function
    this.initVis();
}

initVis() {

}
updateVis() {
	
}