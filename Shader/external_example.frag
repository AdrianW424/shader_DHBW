#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float TLeng(vec2 tk, vec2 ta, vec2 tb){
    vec2 ka = tk-ta;
    vec2 ba = tb-ta;
    float tt = clamp(dot(ka, ba) / dot(ba,ba), 0., 1.);
    return length(ka-ba*tt);
}

float Tk1(vec2 tk) {
    tk = fract(tk*vec2(255.447, 752.956));
    tk += dot(tk, tk + 23.45);
    return fract(tk.x * tk.y);
}

vec2 Tk2(vec2 tk){
    float tn = Tk1(tk);
    return vec2(tn, Tk1(tk+tn));
}

vec2 TPosi(vec2 id, vec2 offset){ 
    vec2 tn = Tk2(id+offset)*u_time;
    return offset+sin(tn)*.4;
}

float TLight(vec2 tk, vec2 ta, vec2 tb){
    float td = TLeng(tk, ta, tb);
    float tm = smoothstep(.03, .01, td);
    float te = length(ta-tb);
    tm *= smoothstep(1.2, 5.8, te) + smoothstep(.3, .01, abs(te-.55));
    return tm;
}

float TLine(vec2 uv, float tgab){
    float tm = 0.;
    vec2 inli = fract(uv)- 0.5;
    vec2 id = floor(uv+tgab);
    vec2 tk[9];
    int i=0;
    
    for(float ty = -1.; ty <=1.; ty++){
        for(float tx = -1.; tx <=1.; tx++){
            //tk[i++] = TPosi(id, vec2(tx, ty));
            tk[1] = TPosi(id, vec2(tx, ty));
        }    
    }
    
    for(int i = 0; i<9;i++){
        tm += TLight(inli, tk[4], tk[i]);
        vec2 k = (tk[i]- inli)*20.;
        float shining = 1./ dot(k, k);
        tm += shining * ( sin( u_time * 10. + fract( tk[i].x) * 10.) * .5 + .5);
    }

    tm += TLight(inli, tk[1], tk[3]);
    tm += TLight(inli, tk[1], tk[5]);
    tm += TLight(inli, tk[7], tk[3]);
    tm += TLight(inli, tk[7], tk[5]);
    
    return tm;
}



void main()
{
    vec2 uv = (gl_FragCoord.xy-u_resolution.xy*.5)/u_resolution.y;
    vec2 tmou = (u_mouse.xy/u_resolution.xy) - .5;
    float tm = 0.;
    float tuvy = uv.y + 0.5;
    float tuvx = uv.x - 0.;
    float ts = sin(u_time*0.1);
    float tc = cos(u_time*0.1);
    mat2 tr = mat2 ( tc, -ts, ts, tc);
    
    uv *= tr;
    tmou *= tr;
    
    for(float i = 0.; i <=1. ; i += 1./5.){
        
        float tz = fract (i+ u_time*.05);
        float tsi = mix(10. , .5, tz);
        float tf = smoothstep(0. , .5 ,tz) * smoothstep(1. , .8, tz);
        tm += TLine(uv * tsi + i*20. -tmou, i*0.1) * tf;
    }
    
    vec3 tcolb = sin(u_time * vec3(.333, .444, .555))*0.4+0.6;
    
    vec3 tcol = tm*tcolb;
    tcol /= tcolb*tuvy*15.;
    tcol += tcolb*tuvy*0.1;
        
        
    //tcol /= tcolb*tuvy*sin(u_time * vec3(.333, .444, .555))*0.4+0.6;
    //tcol /= tcolb+tm*sin(u_time * vec3(.333, .0, .0))*10.+0.8;
       
    tcol -= abs(tcolb*uv.y)*sin(u_time)*.1+0.05;
    //tcol -= tuvx/abs(tcolb*uv.x)*0.005;
        
    gl_FragColor = vec4(tcol,1);	
}
