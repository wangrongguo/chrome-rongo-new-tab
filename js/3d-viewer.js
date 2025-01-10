// 初始化场景、相机和渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('3d-canvas'),
    antialias: true
});

// 设置渲染器尺寸
function resizeRenderer() {
    const container = document.getElementById('model-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// 设置相机位置
camera.position.z = 5;

// 创建 BLEND 加载器
const loader = new THREE.BLENDLoader();

// 加载模型
loader.load('images/baby.blend', function(object) {
    scene.add(object);
}, undefined, function(error) {
    console.error('加载模型时出错:', error);
});

// 自动旋转
let rotationSpeed = 0.01;

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (scene.children.length > 2) { // 大于2是因为场景中已经有两个光源
        scene.children[2].rotation.y += rotationSpeed;
    }
    
    renderer.render(scene, camera);
}

// 监听窗口大小变化
window.addEventListener('resize', resizeRenderer);

// 初始化尺寸并开始动画
resizeRenderer();
animate(); 