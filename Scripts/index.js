const canvas=document.querySelector("canvas");
const c=canvas.getContext('2d');

canvas.height=window.innerHeight;
canvas.width=window.innerWidth;

const mouse={
    x: window.innerWidth/2,
    y: window.innerHeight/2
}

const color_palate=['orange','#590202','#8C0303','#5C5664','#024059','#0D0D0D','black'];

console.log(window.innerWidth);
let n=Math.floor((0.00008)*window.innerWidth*window.innerHeight);
let radius=Math.floor((0.00002)*window.innerWidth*window.innerHeight); //40;
console.log(radius);

window.addEventListener('mousemove',function(event){
    mouse.x=event.x;
    mouse.y=event.y;
})
window.addEventListener('resize',function(){
    canvas.height=window.innerHeight;
    canvas.width=window.innerWidth;
    n=Math.floor((0.00008)*window.innerWidth*window.innerHeight);
    radius=Math.floor((0.00002)*window.innerWidth*window.innerHeight);
    // n=Math.floor((400/1920)*window.innerWidth);
    init();
})

//utility functions
function randomIntFromRange(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}
function randomColor(color_palate){
    return color_palate[Math.floor(Math.random()*color_palate.length)];
}
function distance(x1, y1, x2, y2){
    const xDist=x2-x1;
    const yDist=y2-y1;
    return Math.sqrt((xDist*xDist)+(yDist*yDist));
}


function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}


//Objects
function Particle(x,y,radius,color)
{
    this.x=x;
    this.y=y;
    this.velocity={
        x:(Math.random()-0.5)*5,
        y:(Math.random()-0.5)*5
    }
    this.radius=radius;
    this.color=randomColor(color_palate);
    this.mass=1;
    this.opacity=0;
    this.draw=function(){
        c.beginPath();
        c.strokeStyle=this.color;
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.save();
        c.globalAlpha=this.opacity;
        c.fillStyle=this.color;
        c.fill();
        c.restore();
        c.strokeStyle=this.color;
        c.stroke();
        c.closePath();
    };
    this.update=function(particles){
        this.draw();
        for(let i=0;i<particles.length;i++)
            if(this!==particles[i] && distance(this.x, this.y, particles[i].x, particles[i].y)-this.radius*2 < 0){
                // console.log('has collided');
                resolveCollision(this, particles[i]);
            }
        if(this.x-this.radius<=0 || this.x+this.radius>=window.innerWidth)
            this.velocity.x*=-1;
        if(this.y-this.radius<=0 || this.y+this.radius>=window.innerHeight)
            this.velocity.y*=-1;
        if(distance(mouse.x,mouse.y,this.x,this.y)<100 && this.opacity<0.2){
            this.opacity+=0.02;
        }else if(this.opacity>0){
            this.opacity-=0.02;
            this.opacity=Math.max(0,this.opacity);
        }
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
    };
}

//Implementation
let particles;
function init(){
    particles=[];
    for(let i=0;i<n;i++)
    {
        let x=randomIntFromRange(radius,window.innerWidth-radius);
        let y=randomIntFromRange(radius,window.innerHeight-radius);
        const color="blue";

        if(i>0)
            for(let j=0;j<particles.length;j++)
                if(distance(x, y, particles[j].x, particles[j].y)-radius*2 < 0){
                    x=randomIntFromRange(radius,window.innerWidth-radius);
                    y=randomIntFromRange(radius,window.innerHeight-radius);
                    j=-1;
                }

        particles.push(new Particle(x,y,radius,color));
    }
}

//Animation logo
function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<particles.length;i++)
        particles[i].update(particles);
    // c.fillText(" HTML CANVAS BOILERPLATE",mouse.x,mouse.y);
}

init();
animate();