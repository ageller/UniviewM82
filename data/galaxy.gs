layout(triangles) in;
layout(triangle_strip, max_vertices = 256) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform float uv_fade;


uniform float userPsize;
uniform float userScale;
uniform float userRotationX;
uniform float userRotationY;
uniform float userRotationZ;

uniform float vMax;
uniform float highVPsize;
uniform float highVdt;
uniform bool useHighV;
uniform bool doLine;

out vec2 texcoord;
out float velocityMag;
out float colormapVar;

#define PI 3.14159265359

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

void drawCylinder(vec3 position, vec3 velocity, float radius, float dt)
{

	texcoord = vec2(0,0);

	vec3 p1 = position;
	vec3 p2 = position + velocity*dt;

	float Npoints = 10.;
	float angle = 0.;
	float deltaAngle = 2.*PI/Npoints;
	vec3 p = vec3(0.);

	//bottom
	for (float angle=0; angle<=2.*PI; angle += deltaAngle){
		gl_Position = uv_modelViewProjectionMatrix * vec4(p1, 1.);
		EmitVertex();

		p = vec3(p1.xyz + vec3(radius*cos(angle), radius*sin(angle), 0));
		gl_Position = uv_modelViewProjectionMatrix * vec4(p, 1.);
		EmitVertex();

	}

	//side
	for (float angle=0; angle<=2.*PI; angle += deltaAngle){
		p = vec3(p1.xyz + vec3(radius*cos(angle), radius*sin(angle), 0));
		gl_Position = uv_modelViewProjectionMatrix * vec4(p, 1.);
		EmitVertex();

		p = vec3(p2.xyz + vec3(radius*cos(angle), radius*sin(angle), 0));
		gl_Position = uv_modelViewProjectionMatrix * vec4(p, 1.);
		EmitVertex();
	}

	//top
	for (float angle=0; angle<=2.*PI; angle += deltaAngle){
		gl_Position = uv_modelViewProjectionMatrix * vec4(p2, 1.);
		EmitVertex();

		p = vec3(p2.xyz + vec3(radius*cos(angle), radius*sin(angle), 0.));
		gl_Position = uv_modelViewProjectionMatrix * vec4(p, 1.);
		EmitVertex();

	}

	EndPrimitive();


}


void main()
{

	velocityMag = gl_in[2].gl_Position.x;
	colormapVar = gl_in[2].gl_Position.z; //log10(density)

	vec3 pos = vec3(gl_in[0].gl_Position.x, gl_in[0].gl_Position.y, gl_in[0].gl_Position.z);
	vec3 vel = vec3(gl_in[1].gl_Position.x, gl_in[1].gl_Position.y, gl_in[1].gl_Position.z);
	mat3 rotX = rotationMatrix(vec3(1,0,0), userRotationX);
	mat3 rotY = rotationMatrix(vec3(0,1,0), userRotationY);
	mat3 rotZ = rotationMatrix(vec3(0,0,1), userRotationZ);
	
	float size = userPsize;
	if (velocityMag >= vMax){
		size = highVPsize;
	}
	if ((velocityMag < vMax && !useHighV) || (velocityMag > vMax && useHighV)){
		if (doLine){
			drawCylinder(rotX*rotY*rotZ*pos, rotX*rotY*rotZ*vel, size, highVdt);
		} else {
			drawSprite(vec4(rotX*rotY*rotZ*pos, 1.), size, 0);
		}
	}	
	
	

}