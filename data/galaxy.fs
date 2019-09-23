uniform float uv_fade;
uniform float userAlpha;
uniform float vMax;
uniform float cmapMin;
uniform float cmapMax;
uniform float highVAlpha;
uniform bool doLine;

uniform sampler2D cmap;


in vec2 texcoord;
in float velocityMag;
in float colormapVar;

out vec4 fragColor;

void main()
{

	vec2 cPos = vec2( clamp((colormapVar - cmapMin)/(cmapMax - cmapMin), 0.01, 0.99), 0.5);
    vec4 color = texture2D( cmap, cPos );

	float alpha = userAlpha;
	if (velocityMag >= vMax){
		alpha = highVAlpha;
		//color = vec4(1,0,0, 1.);
	}
	fragColor = vec4(color.rgb, 1.);
	fragColor.a *= uv_fade*alpha;

	if (!doLine){
		vec2 fromCenter = texcoord * 2 - vec2(1);
		float dist = dot(fromCenter, fromCenter);
		//fragColor.a *= exp(-0.5*dist/0.1);
		//fragColor.a = smoothstep(1., 0., dist);
		if (dist > 1){
			discard;
		}
	}

}