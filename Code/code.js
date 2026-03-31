document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('customPlayBtn');
    const video = document.getElementById('videoPlayer');
    const container = document.querySelector('.video-container');
    
    playBtn.addEventListener('click', () => {
        video.play();
        video.controls = true;  // Показать стандартные контролы после старта
        container.classList.add('playing');
    });
});


// Интерактивная карта
document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('map_viewport');
    const container = document.getElementById('map_container');
    const mapImage = document.getElementById('map_image');
    const buttons = document.querySelectorAll('.map_btn_img');
    const zoomIn = document.getElementById('zoom_in');
    const btnToggle = document.getElementById('btn_toggle');
   


    // Проверка что элементы существуют
    if (!viewport || !container || !mapImage) {
        console.error('Не найдены элементы карты!');
        return;
    }
    
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    let scale = 1;
    let currentBuilding = 'building1';
    let isExpanded = false;
    
    // Карты для каждого корпуса/общежития
    const buildingMaps = {
        building1: 'design/ммм сайт/screens/blok_map/svg_files_for_map/карта.svg',
        building2: 'design/ммм сайт/screens/blok_map/svg_files_for_map/карта.svg',
        building3: 'design/ммм сайт/screens/blok_map/svg_files_for_map/карта.svg',
        building4: 'design/ммм сайт/screens/blok_map/svg_files_for_map/карта.svg',
        building5: 'design/ммм сайт/screens/blok_map/svg_files_for_map/карта.svg',
        dorm1: 'design/ммм сайт/screens/blok_map/svg_files_for_map/obschaga_1.svg',
        dorm2: 'design/ммм сайт/screens/blok_map/svg_files_for_map/obschaga_2.svg'
    };
    
    // Позиции для каждого корпуса
    const buildingPositions = {
        building1: { x: 0, y: -1375, scale: 1 },
        building2: { x: 0, y: -880, scale: 0.95 },
        building3: { x: 15, y: -480, scale: 0.95 },
        building4: { x: 0, y: -170, scale: 1 },
        building5: { x: 0, y: 20, scale: 1 },
        dorm1: { x: 0, y: -155, scale: 0.8 },
        dorm2: { x: 0, y: 80, scale: 0.9 }
    };
    
    // Корпуса для которых НУЖЕН сдвиг вниз при раскрытии
    const buildingsWithOffset = ['building1', 'building2', 'building3', 'building4', 'dorm1', 'dorm2'];
    
    // Drag & Drop
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - viewport.offsetLeft;
        startY = e.pageY - viewport.offsetTop;
        scrollLeft = -getTranslateX();
        scrollTop = -getTranslateY();
        viewport.style.cursor = 'grabbing';
    });
    
    viewport.addEventListener('mouseleave', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
    });
    
    viewport.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
    });
    
    viewport.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const y = e.pageY - viewport.offsetTop;
        const walkX = (x - startX) * 1;
        const walkY = (y - startY) * 1;
        setTransform(scrollLeft + walkX, scrollTop + walkY, scale);
    });
    
    // Кнопки корпусов и общежитий
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        console.log('Клик:', btn.dataset.building);
        
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBuilding = btn.dataset.building;
        
        viewport.classList.remove('building1', 'building2', 'building3', 'building4', 'building5', 'dorm1', 'dorm2');
        viewport.classList.add(currentBuilding);
        
        // Меняем изображение карты
        if (buildingMaps[currentBuilding]) {
            mapImage.src = buildingMaps[currentBuilding];
        }

	const dorm1Marker = document.getElementById('dorm1_marker');
        const dorm2Marker = document.getElementById('dorm2_marker');
        
        if (dorm1Marker && dorm2Marker) {
            dorm1Marker.style.display = 'none';
            dorm2Marker.style.display = 'none';
            
            if (currentBuilding === 'dorm1') {
                dorm1Marker.style.display = 'block';
            } else if (currentBuilding === 'dorm2') {
                dorm2Marker.style.display = 'block';
            }
        }
        
        
        // ← ИСПРАВЛЕНО: Не сбрасываем для корпусов, только для общежитий
        const pos = buildingPositions[currentBuilding];
        if (pos) {
            scale = pos.scale;
            setTransform(pos.x, pos.y, scale);
        }
    });
});
    
    // Кнопка увеличения масштаба
    if (zoomIn) {
        zoomIn.addEventListener('click', () => {
            scale = Math.min(scale + 0.2, 3);
            setTransform(getTranslateX(), getTranslateY(), scale);
        });
    }
    
    // Кнопки раскрытия/закрытия окна (ДВЕ отдельные кнопки)
const btnExpand = document.getElementById('btn_toggle_expand');
const btnCollapse = document.getElementById('btn_toggle_collapse');

// Клик по кнопке "Раскрыть"
if (btnExpand) {
    btnExpand.addEventListener('click', () => {
        console.log('Клик по РАСКРЫТЬ!');
        viewport.classList.add('expanded');
        btnExpand.style.display = 'none';
        btnCollapse.style.display = 'block';
    });
}

// Клик по кнопке "Свернуть"
if (btnCollapse) {
    btnCollapse.addEventListener('click', () => {
        console.log('Клик по СВЕРНУТЬ!');
        viewport.classList.remove('expanded');
        btnCollapse.style.display = 'none';
        btnExpand.style.display = 'block';
    });
}
    
    // Вспомогательные функции
    function getTranslateX() {
        const transform = container.style.transform;
        if (!transform) return 0;
        const match = transform.match(/translate\((-?\d+)px/);
        return match ? parseInt(match[1]) : 0;
    }
    
    function getTranslateY() {
        const transform = container.style.transform;
        if (!transform) return 0;
        const match = transform.match(/,\s*(-?\d+)px/);
        return match ? parseInt(match[1]) : 0;
    }
    
    function setTransform(x, y, s) {
        const yOffset = (isExpanded && buildingsWithOffset.includes(currentBuilding)) ? 35 : 0;
        container.style.transform = `translate(${x}px, ${y + (yOffset * viewport.offsetHeight / 100)}px) scale(${s})`;
        scale = s;
    }
    
    // Инициализация
    setTransform(0, 0, 1);
    
    console.log('Карта инициализирована');
});
// Данные для каждого направления
const directionsData = [
    {
        level: 'Бакалавриат/Очная',
	    title: 'Прикладная математика <br> и информатика',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ_инф.svg',
	    description: 'Это направление для инженеров, мыслящих формулами. Фокус на алгоритмизации, разработке <br> математического обеспечения и высокопроизводительных вычислениях. Выпускники работают на стыке <br> чистой науки и IT, создавая передовые решения в области Data Science, Machine Learning и финансового <br> моделирования.'
    },
    {
        level: 'Бакалавриат/Очная',
        title: 'Прикладная механика',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ.svg',
	    description: 'Станьте инженером, который понимает законы движения и прочности. Мы готовим специалистов по анализу <br> напряжений, динамике машин и проектированию несущих конструкций, способных создавать надежные, <br>  долговечные и эффективные механизмы – от авиационных двигателей до высокоточного оборудования.'
    },
    {
        level: 'Специалитет/Очная',
	    title: 'Электроника и автоматика <br> физических установок',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ_инф.svg',
	    description: 'Мы готовим инженеров, способных создавать, настраивать и обслуживать сложнейшее научное и <br> промышленное оборудование. Вы освоите принципы схемотехники, систем управления и обработки сигналов, <br> применяя их для автоматизации физических установок (лазерных систем, ускорителей, детекторов). Вы <br> станете мостом между физикой и технической реализацией.'
    },
    {
        level: 'Бакалавриат/Очная',
        title: 'Экономика',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_мат_рус_общ_ист.svg',
	    description: 'Мы готовим профессионалов, способных анализировать сложные рыночные процессы, прогнозировать <br> тренды и принимать обоснованные управленческие решения. Вы освоите современный эконометрический <br> инструментарий, макро- и микроэкономическое моделирование. Станьте ключевым аналитиком в бизнесе, <br> финансах или государственном секторе.'
    },
    {
        level: 'Бакалавриат/Очно-заочная, Очная',
	    title: 'Информатика и вычислительная <br> техника',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ_инф.svg',
	    description: 'Фундаментальная подготовка по программированию, алгоритмизации и системному анализу. <br> Освоение полного цикла разработки ПО позволит выпускникам работать в любой IT-сфере: от Data <br> Science до кибербезопасности. Готовим инженеров, способных проектировать надежные и адаптивные <br> цифровые решения. Ваши знания станут основой для создания технологий завтрашнего дня.'
    },
    {
        level: 'Бакалавриат/Очная',
	    title: 'Информационные системы <br> и технологии',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ_инф.svg',
	    description: 'Освойте искусство работы с данными и построения интегрированных IT-решений. Программа фокусируется на <br> базах данных, системном администрировании, веб-технологиях и обеспечении качества ПО. Вы будете <br>  проектировать системы, которые работают эффективно и бесперебойно.'
    },
    {
        level: 'Бакалавриат/Очная',
	    title: 'Конструкторско-технологическое <br> обеспечение машиностроительных <br> производств',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ.svg',
	    description: 'Фундаментальная подготовка в области проектирования деталей, выбора материалов и оптимизации <br> производственных процессов. Выпускники владеют всем комплексом знаний для обеспечения выпуска <br> конкурентоспособной продукции: от конструирования <br> до метрологии и контроля качества на производстве.'
    },
    {
        level: 'Бакалавриат/Очная',
            title: 'Прикладная математика и физика',
        egeImage: 'design/ммм сайт/screens/blok_directions/svg_files_for_directions/егэ_матан_рус_физ.svg',
	    description: 'Вы получаете уникальное двойное фундаментальное образование, которое объединяет строгий <br> математический аппарат с глубоким пониманием законов природы. Выпускиники готовы к работе в передовых <br> облостях, где требуются прорывные решения: квантовые технологии, создание новых материалов, <br> высокоточные вычисления и моделирование физических процессов.'
    }
];

let currentDirection = 1;
const ACTIVE_ZONE_PERCENT = 0.30;  // ← 30% от левого края

// ← ИСПРАВЛЕННАЯ функция прокрутки
function scrollToCard(cardElement) {
    const container = document.querySelector('.directions_carousel');
    
    // Абсолютная позиция центра карточки в прокручиваемой области
    const cardAbsoluteCenter = cardElement.offsetLeft + cardElement.offsetWidth / 2;
    
    // Целевая позиция (30% от ширины контейнера)
    const targetPosition = container.offsetWidth * ACTIVE_ZONE_PERCENT;
    
    // Прокручиваем так, чтобы центр карточки совпал с целевой позицией
    container.scrollTo({
        left: cardAbsoluteCenter - targetPosition,
        behavior: 'smooth'
    });
}

// Функция изменения направления
function changeDirection(delta) {
    const cards = document.querySelectorAll('.direction_card');
    const totalCards = cards.length;

    currentDirection += delta;
    if (currentDirection < 0) currentDirection = 0;
    if (currentDirection >= totalCards) currentDirection = totalCards - 1;

    cards.forEach(card => card.classList.remove('active'));
    cards[currentDirection].classList.add('active');

    // ← ИСПОЛЬЗУЕМ исправленную функцию
    scrollToCard(cards[currentDirection]);

    updateDetails(currentDirection);
}

// Функция обновления детальной информации
function updateDetails(index) {
    const data = directionsData[index];
    if (!data) return;
    
    const descriptionElement = document.getElementById('detail_description');
    
    // Добавляем класс
    descriptionElement.classList.add('justified');
    
    // Вставляем текст
    descriptionElement.innerHTML = data.description;
    
    // Обновляем остальное
    document.querySelector('.detail_level').textContent = data.level;
    document.querySelector('.detail_title').innerHTML = data.title;
    const egeImg = document.getElementById('ege_image');
    if (egeImg) egeImg.src = data.egeImage;
}

 

// Клик по карточке
document.querySelectorAll('.direction_card').forEach((card, index) => {
    card.addEventListener('click', function() {
        currentDirection = index;
        
        document.querySelectorAll('.direction_card').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        
        updateDetails(index);
        
        // ← ИСПОЛЬЗУЕМ исправленную функцию
        scrollToCard(this);
    });
});

// ← Инициализация при загрузке: позиционируем активную карточку
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.direction_card');
    if (cards[currentDirection]) {
        // Без анимации при первой загрузке
        const container = document.querySelector('.directions_carousel');
        const cardElement = cards[currentDirection];
        const cardAbsoluteCenter = cardElement.offsetLeft + cardElement.offsetWidth / 2;
        const targetPosition = container.offsetWidth * ACTIVE_ZONE_PERCENT;
        container.scrollLeft = cardAbsoluteCenter - targetPosition;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.leadership_section');
    const container = document.querySelector('.leadership_container');
    const cards = document.querySelectorAll('.leadership_card');
    const fixedAtom = document.querySelector('.leadership_atom_fixed');
    
    if (!section || !container || cards.length === 0) return;

    let currentCardIndex = 0;
    let maxCardIndex = cards.length - 1;
    let cardWidth = 0;
    let isAnimating = false;
    let currentRotation = 0;  // ← Отдельная переменная для угла вращения

    function init() {
        const rect = cards[0].getBoundingClientRect();
        const gap = 5 * window.innerWidth / 100;
        cardWidth = rect.width + gap;
    }

    function checkInSection() {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        return rect.top <= windowHeight * 0.1 && rect.bottom >= windowHeight * 0.9;
    }

    function goToCard(index, direction) {
        if (isAnimating) return;
        
        index = Math.max(0, Math.min(maxCardIndex, index));
        if (index === currentCardIndex) return;
        
        currentCardIndex = index;
        isAnimating = true;
        
        const scrollPosition = currentCardIndex * cardWidth;
        
        container.style.transition = 'transform 0.5s ease-out';
        container.style.transform = `translateX(-${scrollPosition}px)`;
        
        // ← Вращение зависит от направления скролла
        if (fixedAtom) {
            // direction: 1 = вправо (по часовой), -1 = влево (против часовой)
            currentRotation += direction * 180;
            
            fixedAtom.style.transition = 'transform 0.5s ease-out';
            fixedAtom.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
        }
        
        setTimeout(() => {
            isAnimating = false;
            container.style.transition = 'none';
            if (fixedAtom) fixedAtom.style.transition = 'none';
        }, 500);
    }

    function handleWheel(e) {
        if (!checkInSection()) return;
        
        const isScrollingDown = e.deltaY > 0;
        const isAtStart = currentCardIndex <= 0;
        const isAtEnd = currentCardIndex >= maxCardIndex;
        
        if (isAtStart && !isScrollingDown) return;
        if (isAtEnd && isScrollingDown) return;
        
        e.preventDefault();
        
        // direction: 1 = вправо, -1 = влево
        const direction = isScrollingDown ? 1 : -1;
        
        if (isScrollingDown) {
            goToCard(currentCardIndex + 1, direction);
        } else {
            goToCard(currentCardIndex - 1, direction);
        }
    }

    function handleKeydown(e) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (!checkInSection()) return;
        
        const isAtStart = currentCardIndex <= 0;
        const isAtEnd = currentCardIndex >= maxCardIndex;
        
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
            if (isAtEnd) return;
            e.preventDefault();
            goToCard(currentCardIndex + 1, 1);  // ← Вправо (по часовой)
        }
        else if (['ArrowUp', 'PageUp'].includes(e.key)) {
            if (isAtStart) return;
            e.preventDefault();
            goToCard(currentCardIndex - 1, -1);  // ← Влево (против часовой)
        }
    }

    window.addEventListener('load', init);
    window.addEventListener('resize', () => { init(); goToCard(currentCardIndex, 0); });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                currentCardIndex = 0;
                currentRotation = 0;  // ← Сброс вращения
                container.style.transform = 'translateX(0)';
                if (fixedAtom) {
                    fixedAtom.style.transform = 'translate(-50%, -50%) rotate(0deg)';
                }
            }
        });
    }, { threshold: 0.1 });
    observer.observe(section);
});

// Форма обратной связи - Formspree
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                userName: document.getElementById('userName').value,
                userContact: document.getElementById('userContact').value,
                to_email: 'interlet37@gmail.com'
            };

            // Отправка через Formspree
            try {
                const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
                    contactForm.reset();
                } else {
                    alert('Произошла ошибка. Попробуйте позже.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка. Попробуйте позже.');
            }
        });
    }
});

// Кнопка "Наверх"
document.addEventListener('DOMContentLoaded', () => {
    const toTopBtn = document.getElementById('toTopBtn');

    if (toTopBtn) {
        toTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
