
function Vector(_value) {
	this.value = _value;

	this.add = function(_vector) {
		this.value[0] += _vector.value[0];
		this.value[1] += _vector.value[1];
		return this;
	}
	this.dotProduct = function(_vector) {
		return 	this.value[0] * _vector.value[0] + 
				this.value[1] * _vector.value[1];
	}

	this.crossProduct = function(_vector) {
		return this.value[0] * _vector.value[1] - this.value[1] * _vector.value[0];
	}

	
	this.difference = function(_vector) {
		return new Vector([
			_vector.value[0] - this.value[0],
			_vector.value[1] - this.value[1],
		]);
	}

	this.getPerpendicular = function() {
		return new Vector([
			this.value[1],
			-this.value[0]
		]);
	}

	this.scale = function(_scalar) {
		this.value[0] *= _scalar;
		this.value[1] *= _scalar;
		return this;
	}


	this.copy = function() {
		return new Vector([this.value[0], this.value[1]]);
	}



	this.rotate = function(_angle) {
		this.setAngle(this.getAngle() + _angle, this.getLength());
		return this;
	}


	this.getLength = function() {
		return Math.sqrt(this.dotProduct(this));
	}
	
	this.setLength = function(_length) {
		let length = this.getLength();
		if (length == 0) return this;
		
		this.scale(_length / length);
		return this;
	}


	this.getAngle = function() { // check
		return Math.atan2(this.value[1], this.value[0]);
	}
	
	this.setAngle = function(_angle, _radius = 1) {
		_angle = .5 * Math.PI - _angle;

		this.value[0] = Math.sin(_angle) * _radius;
		this.value[1] = Math.cos(_angle) * _radius;
		return this;
	}

	this.getProjection = function(_projectionVector) {
		let dAngle = _projectionVector.getAngle() - this.getAngle();
		let length = _projectionVector.getLength() * Math.cos(dAngle);
		return new Vector([0, 0]).setAngle(this.getAngle(), length);
	}







	// function applyFactor(_entity, _factor) {
	// 	let fx = Math.cos(_factor.angle) * _factor.power;
	// 	let fy = -Math.sin(_factor.angle) * _factor.power;

	// 	return {x: _entity.x + fx, y: _entity.y + fy};
	// }

	// function calcFactor(_entity) {
	// 	let inRange = getAllEntityFactorsWithinRange(_entity);
	// 	let sumFactor = {
	// 		angle: 0,
	// 		power: 0
	// 	};

	// 	for (factor of inRange)
	// 	{
	// 		sumFactor = addFactors(sumFactor, factor);
	// 	}

	// 	return sumFactor;
	// }

	// function addFactors(_factor1, _factor2) {
	// 	let f1x = Math.cos(_factor1.angle) 	* _factor1.power;
	// 	let f1y = -Math.sin(_factor1.angle) * _factor1.power;
	// 	let f2x = Math.cos(_factor2.angle) 	* _factor2.power;
	// 	let f2y = -Math.sin(_factor2.angle) * _factor2.power;

	// 	let newX = f1x + f2x;
	// 	let newY = f1y + f2y;

	// 	return {
	// 		angle: atanWithDX(newX, newY),
	// 		power: Math.sqrt(newX * newX + newY * newY)
	// 	}
	// }
		
}




	// function apply(_entity) {
	// 	let coords = applyFactor(_entity, calcFactor(_entity));
	// 	_entity.x = coords.x;
	// 	_entity.y = coords.y;
	// }
