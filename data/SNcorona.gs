layout(triangles) in; //seems necessary to have this even if I don't need any data?
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;

uniform sampler2D stateTexture;
uniform float radScale;

out vec2 texcoord;
out float rad;

// axis should be normalized
mat3 rotationMatrix(vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

// Equation 7 from [this paper](https://arxiv.org/abs/1612.02097)
float SNIaLum(float t, float A, float t0, float tb, float a1, float a2, float s)
{
	float ar = 2.*(a1 + 1.);
	float ad = a1 - a2;
	float tfac = (t - t0)/tb;
	return A * tfac**ar * (1. + tfac**(s*ad))**(-2./s);
}

void drawSprite(vec4 position, float radius, float rotation)
{
	vec3 objectSpaceUp = vec3(0, 0, 1);
	vec3 objectSpaceCamera = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
	vec3 cameraDirection = normalize(objectSpaceCamera - position.xyz);
	vec3 orthogonalUp = normalize(objectSpaceUp - cameraDirection * dot(cameraDirection, objectSpaceUp));
	vec3 rotatedUp = rotationMatrix(cameraDirection, rotation) * orthogonalUp;
	vec3 side = cross(rotatedUp, cameraDirection);
	texcoord = vec2(0, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(0, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side - rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side - rotatedUp), 1);
	EmitVertex();
	EndPrimitive();
}

void main()
{
	//this will eventually change to an input file for the light curve
	float eventTime = texture(stateTexture, vec2(0.5)).r;

	//these values fit the data relatively well (see my notebook in rawdata)
	float lum = SNIaLum(eventTime, 1., -2., 13., 0.1, -2.2, 0.6);
	rad = radScale*lum;

	drawSprite(vec4(gl_in[0].gl_Position.xyz, 1.), rad, 0);


}
