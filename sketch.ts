/// <reference path="typings/p5js/p5.d.ts"/>

const g: number = 100;

class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }

    add(other: Vec2): Vec2 {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vec2): Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    multiply(s: number): Vec2 {
        return new Vec2(this.x * s, this.y * s);
    }

    normalize() {
        return this.multiply(1 / (this.x + this.y));
    }
}

class Particle {
    pos: Vec2;
    speed: Vec2;
    color: [number, number, number];
    life = 1.0;

    constructor(pos: Vec2, speed: Vec2, color: [number, number, number], life: number) {
        this.pos = pos;
        this.speed = speed;
        this.color = color;
        this.life = life;
    }

    update(dt: number) {
        this.speed.y += g * dt;
        this.pos = this.pos.add(this.speed.multiply(dt));
        this.life -= dt;
    }

    draw(p: p5) {
        p.fill(this.color[0], this.color[1], this.color[2], this.life * 255);
        p.ellipse(this.pos.x, this.pos.y, 5, 5);
    }

}

class Firework extends Particle {

    constructor(pos: Vec2, speed: Vec2, life: number) {
        super(pos, speed, [255, 255, 255], life);
    }

    explode() {
        let new_particles: Particle[] = [];
        for (let i = 0; i < 30; i++) {
            let theta = myp5.random(0.0, 2 * myp5.PI);
            let force = myp5.random(0, 50);
            let speed: Vec2 = new Vec2(myp5.cos(theta), myp5.sin(theta)).multiply(force);
            let color: [number, number, number] = [myp5.random(0, 255), myp5.random(0, 255), myp5.random(0, 255)];
            new_particles.push(new Particle(this.pos, this.speed.add(speed), color, 2));
        }

        particle_system.add(new_particles);
    }

    update(dt: number) {
        super.update(dt);
        if (this.life < 0)
            this.explode();
    }

    draw(p: p5) {
        // p.fill(this.color[0], this.color[1], this.color[2]);
        p.stroke(this.color[0], this.color[1], this.color[2]);
        p.strokeWeight(1);
        p.line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + 10);
        p.noStroke();
    }

}

class HeartFirework extends Firework {
    constructor(pos: Vec2, speed: Vec2, life: number) {
        super(pos, speed, life);
    }

    verts: Vec2[] = [new Vec2(0, -3), new Vec2(1, -4), new Vec2(2, -5.5), new Vec2(3, -5),
    new Vec2(4, -5), new Vec2(5, -4), new Vec2(6, -3), new Vec2(6.5, -2), new Vec2(6, -1),
    new Vec2(5, 0), new Vec2(4, 1), new Vec2(3, 2), new Vec2(2, 3), new Vec2(1, 4),
    new Vec2(0, 5), new Vec2(-1, -4), new Vec2(-2, -5), new Vec2(-3, -5.5), new Vec2(-4, -5),
    new Vec2(-5, -4), new Vec2(-6, -3), new Vec2(-6.5, -2), new Vec2(-6, -1), new Vec2(-5, 0),
    new Vec2(-4, 1), new Vec2(-3, 2), new Vec2(-2, 3), new Vec2(-1, 4)];

    explode() {
        let new_particles: Particle[] = [];
        let color: [number, number, number] = [myp5.random(100, 255), myp5.random(100, 255), myp5.random(100, 255)];
        let spread: number = 10;
        this.verts.forEach(vert => {
            for (let i = 0; i < 10; i++) {
                new_particles.push(
                    new Particle(
                        this.pos.add(new Vec2(myp5.random(-spread, spread),myp5.random(-spread, spread))), 
                        this.speed.add(vert.multiply(10)), 
                        color, 
                        2));        
            }
        });
        particle_system.add(new_particles);
    }
}

class ParticleSystem {

    particles: Particle[] = [];

    constructor() {

    }

    add(new_particles: Particle[]) {
        this.particles = this.particles.concat(new_particles);
    }

    update(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(dt);
            if (particle.life < 0)
                this.particles.splice(i, 1);
        }
    }

    draw(p: p5) {
        for (const particle of this.particles) {
            particle.draw(p);
        }
    }
}

var sketch = function (p: p5) {

    const width: number = 1920;
    const height: number = 1080;

    let curr_time: number;
    let prev_time: number;

    // particle_system.add([
    //     new HeartFirework(new Vec2(1000, height), new Vec2(0, -200), 2)
    // ]);

    p.setup = function () {
        p.createCanvas(width, height);
        p.randomSeed(p.second());
        curr_time = p.millis();
        prev_time = curr_time;
    };

    p.draw = function () {
        curr_time = p.millis();
        let delta_time = (curr_time - prev_time) / 1000;
        prev_time = curr_time;
        // Update
        particle_system.update(delta_time);
        let rand = p.random(0, 100);
        if (rand < 15) {
            particle_system.add([
                new Firework(new Vec2(p.random(20, width - 20), height), new Vec2(0, -p.random(200, 450)), p.random(2.0, 3.0))
            ]);
        } else if (rand < 17) {
            particle_system.add([
                new HeartFirework(new Vec2(p.random(20, width - 20), height), new Vec2(0, -p.random(200, 450)), p.random(2.0, 3.0))
            ]);
        }
        // Draw
        p.noStroke();
        p.background(0);
        p.fill(255);
        particle_system.draw(p);
    };
};

const particle_system = new ParticleSystem();

var myp5 = new p5(sketch);