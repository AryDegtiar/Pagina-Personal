window.addEventListener('scroll', function(){
    let animationMachine = document.getElementsByClassName('machine');
    let animationMachinePosition = animationMachine[0].getBoundingClientRect().top;
    //console.log(animationMachinePosition);
    let screenPosition = window.innerHeight / 0.9;

    if(animationMachinePosition < screenPosition){
        for(let i = 0; i < animationMachine.length; i++){
            var animacion = 'type' + i
            animationMachine[i].classList.add(animacion);
            //console.log(animacion);
        }
    }else{
        for(let i = 0; i < animationMachine.length; i++){
            var animacion = 'type' + i
            animationMachine[i].classList.remove(animacion);
        }
    }
});

function toggle(){
    if(screen.width < 1300){
        let slider = document.getElementById('wrapper');

        slider.classList.toggle("toggled");
    }
}

// loading
window.addEventListener("load", function() {
    const loading = document.getElementById("loading");
    loading.style.display = "none";
});