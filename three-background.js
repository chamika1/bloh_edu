import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

class ThreeBackground {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.particles = [];
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff, 0);
        document.getElementById('three-bg').appendChild(this.renderer.domElement);

        // Update particle settings
        const particleSettings = {
            color: 0x4a90e2,
            count: 150,
            size: 0.08,
            opacity: 0.6,
            speed: 0.015
        };

        // Add particles
        const particleGeometry = new THREE.SphereGeometry(particleSettings.size, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: particleSettings.color,
            transparent: true,
            opacity: particleSettings.opacity
        });

        for (let i = 0; i < particleSettings.count; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.x = Math.random() * 40 - 20;
            particle.position.y = Math.random() * 40 - 20;
            particle.position.z = Math.random() * 40 - 20;
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * particleSettings.speed,
                (Math.random() - 0.5) * particleSettings.speed,
                (Math.random() - 0.5) * particleSettings.speed
            );
            particle.initialY = particle.position.y;
            this.particles.push(particle);
            this.scene.add(particle);
        }

        // Position camera
        this.camera.position.z = 30;

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start animation
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update particle positions
        this.particles.forEach(particle => {
            particle.position.add(particle.velocity);
            
            // Wrap particles around when they go off screen
            if (particle.position.x > 20) particle.position.x = -20;
            if (particle.position.x < -20) particle.position.x = 20;
            if (particle.position.y > 20) particle.position.y = -20;
            if (particle.position.y < -20) particle.position.y = 20;
            if (particle.position.z > 20) particle.position.z = -20;
            if (particle.position.z < -20) particle.position.z = 20;
        });

        // Restore original camera rotation
        this.camera.position.x = 30 * Math.cos(Date.now() * 0.0001);
        this.camera.position.z = 30 * Math.sin(Date.now() * 0.0001);
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThreeBackground();
}); 