// https://developers.google.com/maps/documentation/javascript/marker-clustering
// currently not clear, but the records watcher is _always_ triggered which means we will always draw. not sure why, is it for the initial value?

window.addEventListener("load", function () {
	
	Vue.component("google-data-map-configurator", {
		mixins: [nabu.page.views.data.DataCommon],
		template: "#google-data-map-configurator",
		activate: function(done) {
			var self = this;
			var event = null;
			this.activate(done);
		},
		created: function() {
			this.create();
		}
	});
	
	Vue.view("google-data-map", {
		mixins: [nabu.page.views.data.DataCommon],
		// https://developers.google.com/maps/documentation/javascript/overview#Inline
		data: function() {
			return {
				map: null,
				clusterer: null,
				// a mapping for the markers, based on either lat/lng or (preferably) id field
				markers: {}
			}	
		},
		activate: function(done) {
			var self = this;
			var event = null;
			this.activate(function() {
				done();
			});
		},
		created: function() {
			this.create();
		},
		methods: {
			draw: function() {
				var el = this.$refs.map;
				
				// only draw once, don't redraw on every records change, we only need to update the markers
				if (!this.map) {
					var self = this;
					
					if (el && google && google.maps && google.maps.Map) {
						var properties = {};
						
						properties.zoom = this.cell.state.zoom ? Number(this.cell.state.zoom) : 8;
						
						// center map based on record/location or cell state
						var location = this.records[0];
						var lat; 
						var lng;
						
						if (location) {
							lat = location[self.cell.state.latitudeField ? self.cell.state.latitudeField : "latitude"];
							lng = location[self.cell.state.longitudeField ? self.cell.state.longitudeField : "longitude"];
						} else {
							lat = this.cell.state.latitudeCenter ? Number(this.$services.page.interpret(this.cell.state.latitudeCenter, this)) : null;
							lng = this.cell.state.longitudeCenter ? Number(this.$services.page.interpret(this.cell.state.longitudeCenter, this)) : null
						}
						
						properties.center = {
							lat: lat,
							lng: lng
						};
						
						properties.mapTypeControl = !!this.cell.state.mapTypeControl;
						if (properties.mapTypeControl) {
							properties.mapTypeControlOptions = {
								style: google.maps.MapTypeControlStyle[properties.mapTypeControlStyle ? properties.mapTypeControlStyle : "DEFAULT"]
								// TODO: mapTypeIds: ["roadmap", "terrain"],
							}
						}
						properties.zoomControl = !!this.cell.state.zoomControl;
						if (properties.zoomControl && this.cell.state.zoomControlPosition) {
							properties.zoomControlOptions = {
								position: google.maps.ControlPosition[this.cell.state.zoomControlPosition]
							}
						}
						properties.scaleControl = !!this.cell.state.scaleControl;
						if (properties.scaleControl && this.cell.state.scaleControlPosition) {
							properties.scaleControlOptions = {
								position: google.maps.ControlPosition[this.cell.state.scaleControlPosition]
							}
						}
						properties.streetViewControl = !!this.cell.state.streetViewControl;
						if (properties.streetViewControl && this.cell.state.streetViewControlPosition) {
							properties.streetViewControlOptions = {
								position: google.maps.ControlPosition[this.cell.state.streetViewControlPosition]
							}
						}
						properties.fullscreenControl = !!this.cell.state.fullscreenControl;
						if (this.cell.state.styleArray) {
							try {
								var styles = JSON.parse(this.cell.state.styleArray);
								if (styles instanceof Array) {
									properties.styles = styles;
								}
							}
							catch (exception) {
								console.error("Could not parse map style array", exception);
							}
						}
						this.map = new google.maps.Map(el, properties);
					}
					else {
						// try again soon grashopper
						setTimeout(this.draw, 150);
					}
				}
				// draw markers
				if (this.map) {
					var self = this;
					// check which markers have been updated, if we have a marker that was not updated, it might need to be removed
					var markersUpdated = [];
					this.records.forEach(function(record) {
						console.log('record', record);
						var lat = record[self.cell.state.latitudeField ? self.cell.state.latitudeField : "latitude"];
						var lng = record[self.cell.state.longitudeField ? self.cell.state.longitudeField : "longitude"];
						var radius = self.cell.state.radiusField ? record[self.cell.state.radiusField] : null;
						var title = self.cell.state.titleField ? record[self.cell.state.titleField] : null;
						var key = record[self.cell.state.idField ? self.cell.state.idField : "id"];
						if (!key) {
							key = "" + lat + "/" + lng;
						}
						var marker = self.markers[key];
						var properties = { position: {lat: Number(lat), lng: Number(lng)} };
						if (!marker) {
							console.log('no marker');
							var svgCheckmark = "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z";
							var svgCheckmarkScale = 2;
							
							var scale = 1;
							var width = self.cell.state.markerWidth ? parseInt(self.cell.state.markerWidth) : 30;
							var height = self.cell.state.markerHeight ? parseInt(self.cell.state.markerHeight) : 30;
							var svg = null;
							
							if (!self.cell.state.markerSvg) {
								// a basic map marker
								svg = "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z";
								width = 384;
								height = 512;
							}
							else {
								svg = self.cell.state.markerSvg;
							}
							
							var goalWidth = 30;
							var goalHeight = 30;
							if (width >= height && width > goalWidth) {
								scale = goalWidth / width;
							}
							else if (height > width && height > goalHeight) {
								scale = goalHeight / height;
							}
							
							if (title) {
								properties.title = title;
							}
							
							// our goal is to have a marker with a maximum dimension of 30
							var svgMarker = {
								path: svg,
								fillColor: self.cell.state.markerFillColor ? self.cell.state.markerFillColor : "blue",
								fillOpacity: self.cell.state.markerFillOpacity != null ? parseFloat(self.cell.state.markerFillOpacity) : 0.6,
								strokeColor: self.cell.state.strokeColor ? self.cell.state.strokeColor : "blue",
								strokeWeight: self.cell.state.markerStrokeWeight != null ? parseFloat(self.cell.state.markerStrokeWeight) : 1,
								rotation: 0,
								// default measurements of this marker are 384, 512
								scale: scale,
								//anchor: new google.maps.Point((width / 2) * scale, height * scale)
								// no need to include the scale, the anchor is defined to its original size
								anchor: new google.maps.Point((width / 2), height)
							};
							console.log("marker is", svgMarker);
							properties.icon = svgMarker;
							marker = new google.maps.Marker(properties);
							if (radius) {
								var circle = new google.maps.Circle({
									strokeColor: self.cell.state.markerFillColor ? self.cell.state.markerFillColor : "blue",
									strokeOpacity: 1,
									strokeWeight: 1,
									fillColor: self.cell.state.markerFillColor ? self.cell.state.markerFillColor : "blue",
									fillOpacity: 0.2,
									center: properties.position,
									radius: radius * 1000,
								});
								circle.setMap(self.map);
								marker.$radius = circle;
							}
							
							console.log("circle is", circle);
							marker.setMap(self.map);
							marker.addListener("click", function() {
								self.select(record);
								if (self.cell.state.fields && self.cell.state.fields.length > 0) {
									var component = new nabu.page.views.PageFields({ propsData: {
											page: nabu.utils.objects.deepClone(self.page),
											cell: nabu.utils.objects.deepClone(self.cell),
											edit: false,
											data: record,
											label: true
										},
										ready: function() {
											var content = this.$el.outerHTML;
											console.log("rendering content", content);
											var info = new google.maps.InfoWindow({ content: content });
											info.open({
												anchor: marker,
												map: self.map,
												shouldFocus: false
											});
										}
									});
									var div = document.createElement("div");
									div.setAttribute("class", "google-map-popup");
									component.$mount(div);
								}
							});
						}
						// update the marker
						else {
							if (radius) {
								if (marker.$radius) {
									marker.$radius.setMap(null);
								}
								var circle = new google.maps.Circle({
									strokeColor: self.cell.state.markerFillColor ? self.cell.state.markerFillColor : "blue",
									strokeOpacity: 1,
									strokeWeight: 1,
									fillColor: self.cell.state.markerFillColor ? self.cell.state.markerFillColor : "blue",
									fillOpacity: 0.2,
									center: properties.position,
									radius: radius * 1000,
								});
								circle.setMap(self.map);
								marker.$radius = circle;
							}
							//self.map.setCenter(properties.position);
						}
						markersUpdated.push(key);
						self.markers[key] = marker;
					});
					var allMarkers = [];
					Object.keys(this.markers).forEach(function(key) {
						if (markersUpdated.indexOf(key) < 0) {
							if (self.markers[key].$radius) {
								self.markers[key].$radius.setMap(null);
							}
							self.markers[key].setMap(null);
							self.markers[key] = null;
							delete self.markers[key];
						}
						else {
							allMarkers.push(self.markers[key]);
						}
					});
					if (self.clusterer) {
						self.clusterer.setMap(null);
						self.clusterer = null;
					}
					if (self.cell.state.clusterMarkers) {
						new MarkerClusterer(self.map, allMarkers, {
							imagePath: "${server.root()}resources/googlemaps/m"
						});
					}
					
					if (this.records.length > 0) {
						var location = this.records[0];
						if (location) {
							var center = {
								lat: location[self.cell.state.latitudeField ? self.cell.state.latitudeField : "latitude"],
								lng: location[self.cell.state.longitudeField ? self.cell.state.longitudeField : "longitude"]
								
							}
						}
						self.map.setCenter(center);
					}
				}
			},
			configurator: function() {
				return "google-data-map-configurator";
			}
		},
		watch: {
			'records': function() {
				this.draw();	
			}
		}
	});
});