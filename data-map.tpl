<template id="google-data-map-configurator">
	<data-common-configure :page="page" :parameters="parameters" :cell="cell"
			:edit="edit"
			:records="records"
			:selected="selected"
			:inactive="inactive"
			@updatedEvents="$emit('updatedEvents')"
			@close="$emit('close'); configuring=false"
			:multiselect="true"
			:configuring="true"
			:updatable="true"
			:paging="paging"
			:filters="filters"
			@refresh="refresh">

		<div slot="settings">
			<n-collapsible class="padded" title="Map settings">
				<n-form-text v-model="cell.state.latitudeCenter" label="Center Latitude" info="The latitude of the center point of the map as it starts up" :timeout="600"/>
				<n-form-text v-model="cell.state.longitudeCenter" label="Center Longitude" info="The longitude of the center point of the map as it starts up" :timeout="600"/>
				<n-form-text placeholder="8" v-model="cell.state.zoom" label="Zom" info="The zoom of the map as it starts up" :timeout="600"/>
				
				<n-form-combo v-model="cell.state.latitudeField" :items="keys" label="Marker Latitude field"/>
				<n-form-combo v-model="cell.state.longitudeField" :items="keys" label="Marker Longitude field" placeholder="longitude"/>
				<n-form-combo v-model="cell.state.idField" :items="keys" label="Marker Id field" placeholder="id"/>
				<n-form-combo v-model="cell.state.radiusField" :items="keys" label="Radius" placholder="no radius"/>
				<n-form-combo v-model="cell.state.titleField" :items="keys" label="Marker title field"/>
				
				<n-form-switch v-model="cell.state.mapTypeControl" label="Show map type control"/>
				<n-form-combo v-if="cell.state.mapTypeControl" v-model="cell.state.mapTypeControlStyle" label="Type of map control" :items="['DEFAULT', 'DROPDOWN_MENU', 'HORIZONTAL_BAR']"/>
				
				<n-form-switch v-model="cell.state.zoomControl" label="Show zoom control"/>
				<n-form-combo v-if="cell.state.zoomControl" info="More info at https://developers.google.com/maps/documentation/javascript/controls" v-model="cell.state.zoomControlPosition" label="Position of zoom control" :items="['TOP_CENTER', 'LEFT_CENTER', 'TOP_RIGHT', 'LEFT_TOP', 'RIGHT_TOP', 'LEFT_CENTER', 'RIGHT_CENTER', 'LEFT_BOTTOM', 'RIGHT_BOTTOM', 'BOTTOM_CENTER', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']"/>
				
				<n-form-switch v-model="cell.state.scaleControl" label="Show scale control"/>
				<n-form-combo v-if="cell.state.scaleControl" info="More info at https://developers.google.com/maps/documentation/javascript/controls" v-model="cell.state.scaleControlPosition" label="Position of zoom control" :items="['TOP_CENTER', 'LEFT_CENTER', 'TOP_RIGHT', 'LEFT_TOP', 'RIGHT_TOP', 'LEFT_CENTER', 'RIGHT_CENTER', 'LEFT_BOTTOM', 'RIGHT_BOTTOM', 'BOTTOM_CENTER', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']"/>
							
				<n-form-switch v-model="cell.state.streetViewControl" label="Show street view control"/>
				<n-form-combo v-if="cell.state.streetViewControl" info="More info at https://developers.google.com/maps/documentation/javascript/controls" v-model="cell.state.streetViewControlPosition" label="Position of zoom control" :items="['TOP_CENTER', 'LEFT_CENTER', 'TOP_RIGHT', 'LEFT_TOP', 'RIGHT_TOP', 'LEFT_CENTER', 'RIGHT_CENTER', 'LEFT_BOTTOM', 'RIGHT_BOTTOM', 'BOTTOM_CENTER', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']"/>
				
				<n-form-switch v-model="cell.state.fullscreenControl" label="Show fullscreen control"/>
				<n-form-switch v-model="cell.state.clusterMarkers" label="Cluster markers"/>
				<n-form-combo v-if="!cell.state.customClusterMarkerPath" v-model="cell.state.defaultClusterMarkerPath" label="Predefined cluster markers" :items='[{name: "Default", path:"${server.root()}resources/googlemaps/m"}, {name: "Pastel", path:"${server.root()}resources/googlemaps/p"}]' :formatter="function(x) { return x.name }" :extracter="function(x) { return x.path }"/>
				<n-form-text v-if="!cell.state.defaultClusterMarkerPath" v-model="cell.state.customClusterMarkerPath" label="Custom cluster marker path"/>
				

				<n-form-ace v-model="cell.state.styleArray" label="Style Array" mode="json" info="Style arrays can be found on for example https://snazzymaps.com/" />
				
				<n-form-text v-model="cell.state.markerFillColor" label="Default marker fill color" :timeout="600" placeholder="blue"/>
				<n-form-text v-model="cell.state.markerFillOpacity" label="Default marker fill opacity" :timeout="600" placeholder="A decimal between 0-1"/>
				<n-form-text v-model="cell.state.strokeColor" label="Default marker stroke color" :timeout="600" placeholder="darkblue"/>
				<n-form-text v-model="cell.state.strokeWeight" label="Default marker stroke weight" :timeout="600" placeholder="A decimal, e.g. 1"/>
				<n-form-ace v-model="cell.state.markerSvg" label="Default marker svg" info="You can get an svg from for example fontawesome or material icons. You need the M... path that is inside"/>
				<n-form-text v-model="cell.state.markerWidth" label="The native width of the default marker" placeholder="30" :timeout="60"/>
				<n-form-text v-model="cell.state.markerHeight" label="The native height of the default marker" placeholder="30" :timeout="60"/>
			</n-collapsible>
			<n-collapsible class="padded" title="Dynamic Markers">
				<div v-if="cell.state.dynamicMarkers">
					<div v-for="marker in cell.state.dynamicMarkers" class="list-row">
						<n-form-text v-model="marker.condition" label="Marker condition" :timeout="600" placeholder="E.g. state.record.something == true"/>
						<n-form-text v-model="marker.markerFillColor" label="Marker fill color" :timeout="600" placeholder="blue"/>
						<n-form-text v-model="marker.markerFillOpacity" label="Marker fill opacity" :timeout="600" placeholder="1"/>
						<n-form-text v-model="marker.strokeColor" label="Marker stroke color" :timeout="600" placeholder="darkblue"/>
						<n-form-text v-model="marker.strokeWeight" label="Marker stroke weight" :timeout="600" placeholder="1"/>
						<n-form-ace v-model="marker.markerSvg" label="Marker svg" info="You can get an svg from for example fontawesome or material icons. You need the M... path that is inside"/>
						<n-form-text v-model="marker.markerWidth" label="The native width of the marker" placeholder="30" :timeout="60"/>
						<n-form-text v-model="marker.markerHeight" label="The native height of the marker" placeholder="30" :timeout="60"/>
						<span @click="cell.state.dynamicMarkers.splice(cell.state.dynamicMarkers.indexOf(marker), 1)" class="fa fa-times"></span>
					</div>
				</div>
				<div class="list-actions">
					<button @click="addDynamicMarker"><span class="fa fa-plus"></span>Marker</button>
				</div>
			</n-collapsible>
		</div>
	</data-common-configure>
</template>

<template id="google-data-map">
	<div class="google-data-map-container">
		<data-common-header :page="page" :parameters="parameters" :cell="cell"
				:edit="edit"
				:records="records"
				:selected="selected"
				:inactive="inactive"
				@updatedEvents="$emit('updatedEvents')"
				@close="$emit('close'); configuring=false"
				:multiselect="true"
				:configuring="configuring"
				:updatable="true"
				:paging="paging"
				:filters="filters"
				@refresh="refresh">
			</n-collapsible>
		</data-common-header>
		<div ref="map" class="google-data-map"></div>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false" v-if="!cell.state.loadLazy && !cell.state.loadMore"/>
		<div class="load-more" v-else-if="cell.state.loadMore && paging.current != null && paging.total != null && paging.current < paging.total - 1">
			<button class="load-more-button" @click="load(paging.current + 1, true)">%{Load More}</button>
		</div>
		
		<data-common-footer :page="page" :parameters="parameters" :cell="cell" 
			:edit="edit"
			:records="records"
			:selected="selected"
			:inactive="inactive"
			:global-actions="globalActions"
			@updatedEvents="$emit('updatedEvents')"
			@close="$emit('close')"
			:multiselect="true"
			:updatable="true"/>
	</div>
</template>