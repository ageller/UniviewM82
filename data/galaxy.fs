uniform float uv_fade;
uniform float userAlpha;
uniform float vMax;
uniform float vMin;

uniform sampler2D cmap;


in vec2 texcoord;
in float velocityMag;

out vec4 fragColor;

void main()
{

	vec2 cPos = vec2( clamp((velocityMag - vMin)/(vMax - vMin), 0.01, 0.99), 0.5)
    vec4 color = texture2D( cmap, cPos );

	fragColor = vec4(color.rgb, 1.);
	fragColor.a *= uv_fade*userAlpha;
	vec2 fromCenter = texcoord * 2 - vec2(1);
	float dist = dot(fromCenter, fromCenter);

	
	fragColor.a *= exp(-0.5*dist/0.1);

}
