const can = document.querySelector('canvas');
can.width = window.innerWidth * 0.9;
can.height = window.innerHeight * 0.9;
can.style.border = '1px solid black';

const c = can.getContext('2d');

let beep = new Audio('beep');
beep.volume = 1.000;

class Entity{
    constructor(x, y, rad){
        this.x = x;
        this.y = y;
        this.speed = Math.random()*5;
        this.vix = (Math.random() > 0.5 ? -this.speed : this.speed) * Math.random();
        this.viy = (Math.random() > 0.5 ? -this.speed : this.speed) * Math.random();
        this.rad = rad;
        this.vfx = null;
        this.vfy = null;
        this.mass = 1000;
        this.color = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
        this.inCollision = false;
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.rad, 0, Math.PI*2);
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
        c.closePath();
    }
    update(){
        this.draw();
        if(this.x + this.vix + this.rad > can.width || this.x + this.vix - this.rad < 0) this.vix = -this.vix;
        if(this.y + this.viy + this.rad > can.height || this.y + this.viy - this.rad < 0) this.viy = -this.viy;
        this.x += this.vix;
        this.y += this.viy;
    }
}

let collDet = function(obj1, obj2){
    
    return (obj1.x - obj2.x)*(obj1.x - obj2.x) + (obj1.y - obj2.y) * (obj1.y - obj2.y) <= (obj1.rad + obj2.rad) * (obj1.rad + obj2.rad) ;
}

let elasticCol = function(obj1, obj2){

    // Before Collision
    let sysKEnergyX = (obj1.mass * obj1.vix) + (obj2.mass * obj2.vix);
    let sysKEnergyY = (obj1.mass * obj1.viy) + (obj2.mass * obj2.viy);

    let obj1vfx = (sysKEnergyX - (obj1.vix * obj2.mass) + (obj2.vix * obj2.mass)) / (obj1.mass + obj2.mass);
    let obj1vfy = (sysKEnergyY - (obj1.viy * obj2.mass) + (obj2.viy * obj2.mass)) / (obj1.mass + obj2.mass);

    let obj2vfx = (sysKEnergyX - (obj1.mass * obj1vfx)) / obj2.mass;
    let obj2vfy = (sysKEnergyY - (obj1.mass * obj1vfy)) / obj2.mass;

    obj1.vix = obj1vfx;
    obj2.vix = obj2vfx;
    obj1.viy = obj1vfy;
    obj2.viy = obj2vfy;

    // No Kinetic Energy Loss
    // (obj1.mass * obj1.vix) + (obj2.mass * obj2.vix) = (obj1.mass * obj1.vfx) + (obj2.mass * obj2.vfx);
    // 
    // obj1.vix + obj1vfx = obj2.vix + obj2vfx;
    // at this point we know the values of obj1.vix and obj2.vix 
    // we need to isolate one variable in this case let us start with obj2vfx;
    //
    // obj1.vix + obj1vfx - obj2.vix = obj2vfx;
    //
    // we then go back to our earlier equation
    // (obj1.mass * obj1.vix) + (obj2.mass * obj2.vix) = (obj1.mass * obj1.vfx) + (obj2.mass * obj2.vfx);
    // let's replace the left side with sysKEnergyX which we already computed earlier
    // sysKEnergyX = (obj1.mass * obj1vfx) + (obj2.mass * obj2vfx);
    //
    // then let us replace obj2vfx with its equivalent -> obj1.vix + obj1vfx - obj2.vix
    //
    // sysKEnergyX = (obj1.mass * obj1vfx) + (obj2.mass * (obj1.vix + obj1vfx - obj2.vix));
    // 
    // now we only have 1 unknown variable which is obj1vfx which we can then isolate to get the value
    // sysKEnergyX = (obj1.mass * obj1vfx) + (obj2.mass * (obj1.vix + obj1vfx - obj2.vix));
    // sysKEnergyX = (obj1.mass * obj1vfx) + (obj1.vix * obj2.mass) + (obj1vfx * obj2.mass) - (obj2.vix * obj2.mass)));
    // sysKEnergyX - (obj1.vix * obj2.mass) + (obj2.vix * obj2.mass) = (obj1.mass * obj1vfx) + (obj1vfx * obj2.mass);
    // (sysKEnergyX - (obj1.vix * obj2.mass) + (obj2.vix * obj2.mass)) = (obj1.mass * obj1vfx) + (obj1vfx * obj2.mass);
    // 
    // I will then factor the right equation
    // (sysKEnergyX - (obj1.vix * obj2.mass) + (obj2.vix * obj2.mass)) = obj1vfx * (obj1.mass + obj2.mass);
    // let obj1vfx = (sysKEnergyX - (obj1.vix * obj2.mass) + (obj2.vix * obj2.mass)) / (obj1.mass + obj2.mass);
    // let obj1vfy = (sysKEnergyY - (obj1.viy * obj2.mass) + (obj2.viy * obj2.mass)) / (obj1.mass + obj2.mass);
    // let us then solve for obj2vfx;
    // sysKEnergyX = (obj1.mass * obj1vfx) + (obj2.mass * obj2vfx);
    // sysKEnergyX - (obj1.mass * obj1vfx) =  obj2.mass * obj2vfx;
    // let obj2vfx = (sysKEnergyX - (obj1.mass * obj1vfx)) / obj2.mass;
    // let obj2vfy = (sysKEnergyY - (obj1.mass * obj1vfy)) / obj2.mass;

    // obj1.vix = obj1vfx;
    // obj2.vix = obj2vfx;
    // obj1.viy = obj1vfy;
    // obj2.viy = obj2vfy;

}

let entities = [];

for(i = 0 ; i < 10; i++){
    let e1 = new Entity(20 + can.width * Math.random(), 20 + can.height * Math.random(), 20);
    entities.push(e1);
}

let raf = null;

let collisionCount = 0;
let tempHolder;

let mainLoop = function(){
    raf = window.requestAnimationFrame(mainLoop);
    c.clearRect(0,0,can.width,can.height);
    
    entities.forEach((e,i)=>{
        entities.forEach((ee,ii)=>{
            if(i != ii){
                if(collDet(e,ee)) {
                    collisionCount += 1;
                    !e.inCollision ? elasticCol(e,ee) : null;
                }
            }
        });
    });

    entities.forEach(e=> e.update());
    c.fillText(collisionCount, 20, 20);
    entities.forEach((e,i)=> c.fillText(e.vix, 10, 50 + i*11));
}

mainLoop();