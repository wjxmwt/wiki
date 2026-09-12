(function () {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // 开头文字动画
    const introText = document.querySelector(".group-photo-text-container h2");
    const splitText = new SplitText(introText, { type: "chars" });
    gsap.from(splitText.chars, {
        y: 150,
        opacity: 0,
        duration: 2,
        ease: "bounce.out",
        stagger: 0.1
    }, 1);
    // 标题文字动画
    const numTextList = document.querySelectorAll(".project-title-container span");
    numTextList.forEach(numText => {
        gsap.from(numText, {
            opacity: 0,
            y: -100,
            duration: 0.5,
            ease: "power1.out",
            scrollTrigger: {
                trigger: numText,
                start: "top 88%",
                once: true
            }
        });
    });
    const titleTextList = document.querySelectorAll(".project-title");
    titleTextList.forEach(titleText => {
        const splitTitleText = new SplitText(titleText, {
            type: 'chars'
        });
        gsap.from(splitTitleText.chars, {
            opacity: 0,
            x: 150,
            duration: 2,
            ease: "bounce.out",
            stagger: 0.1,
            scrollTrigger: {
                trigger: titleText,
                start: "top 88%",
                once: true
            }
        });
    });
    // 分隔线动画
    gsap.utils.toArray(".project-title-container hr").forEach((line) => {
        gsap.set(line, {
            scaleX: 0,
            transformOrigin: "left center"
        });

        gsap.to(line, {
            scaleX: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: line,
                start: "top 78%",
                once: true
            }
        });
    });
    // leader img play
    const imgList = document.querySelectorAll("img");
    imgList.forEach(img => {
        gsap.from(img, {
            opacity: 0,
            clipPath: "inset(0 0 100% 0)",
            duration: 1,
            ease: "power1.out",
            scrollTrigger: {
                trigger: img,
                start: "top 75%",
                once: true
            }
        });
    })
    // leader introduction play
    const descList = document.querySelectorAll(".introduction");
    descList.forEach(desc => {
        const splitDesc = new SplitText(desc, {
            type: 'lines'
        });
        gsap.from(splitDesc.lines, {
            rotationX: -100,
            transformOrigin: "50% 50% -160px",
            opacity: 0,
            duration: 1,
            ease: "power3",
            stagger: 0.25,
            scrollTrigger: {
                trigger: desc,
                start: "top 70%",
                once: true
            }
        });
    })

    const memberContainerList = document.querySelectorAll(".member-container");
    memberContainerList.forEach(memberContainer => {
        gsap.from(memberContainer, {
            opacity: 0,
            clipPath: "inset(0 100% 0 0)",
            duration: 1,
            ease: "power1.out",
            scrollTrigger: {
                trigger: memberContainer,
                start: "top 75%",
                once: true
            }
        });
    });

    const memberModal = document.querySelector("#memberModal");
    const memberModalImage = document.querySelector("#memberModalImage");
    const memberModalName = document.querySelector("#memberModalName");
    const memberModalRole = document.querySelector("#memberModalRole");
    const memberModalDescription = document.querySelector("#memberModalDescription");
    const memberModalClose = memberModal.querySelector(".member-modal-close");
    const memberDetails = [
        {
            name: "Xinying Li",
            role: "WETLAB MEMBER",
            description: "iGEM has taught me far more than teamwork; it has helped me accomplish goals I once never dared to imagine. For me, it is both a brand-new challenge full of unknowns and a rare opportunity for growth. As a core member of the wet lab group, I took part hands-on in various experimental operations and honed my core laboratory skills. Though it consumed much time, every effort was well worth it. Troubleshooting repeatedly and tackling difficult problems in the lab solidified my professional foundation; collaborating with teammates on experiment design and execution further sharpened my communication and coordination abilities. Together we built our project from zero to one, then pushed it step by step toward one hundred, growing and transforming alongside one another."
        },
        {
            name: "Minxi Qiu",
            role: "WIKI MEMBER",
            description: "As a beginner in web design, I initially thought the Wiki was simply a place to put our results online. Only after joining iGEM and actually getting hands-on did I discover the many details that needed polishing. Technical challenges such as layout adaptation, content rendering, and formatting standards often pushed me to debug and deliberate again and again. Participating in iGEM strengthened my cross-disciplinary collaboration and communication skills, familiarized me with iGEM's Wiki standards, and improved my scientific communication and awareness of teamwork and task division."
        },
        {
            name: "Jiaze Sun",
            role: "WETLAB MEMBER",
            description: "When I first joined the project, I only had a vague impression of it and was largely drawn by how innovative it sounded. After diving into real work, I discovered the discipline behind every successful experiment. From preparing materials to recording results and repeating failed trials, I have developed a stronger sense of responsibility and learned that meaningful progress comes from persistent, careful work."
        },
        {
            name: "Feier Yi",
            role: "HP MEMBER",
            description: "iGEM equipped me with the ability to let the engineering cycle guide my practice, moving steadily toward our goals through implementation, feedback, and iterative optimization, while growing together with friendly competition partners."
        },
        {
            name: "Linying Lan",
            role: "ART MEMBER",
            description: "Joining iGEM made me understand that science requires not only rigorous experiments but also compelling expression. As a team member, I committed myself to turning complex research outcomes into intuitive visual language. Through countless rounds of revision and reflection, I learned to build bridges of communication through design, so that scientific stories can be understood by more people."
        },
        {
            name: "Yuhan Hu",
            role: "ART MEMBER",
            description: "TMy name is Hu Yuhan. In the iGEM art and design group, I was responsible for visual design including the logo, mascot, and presentation slides, learning to present research ideas through creative visuals."
        },
        {
            name: "Yunyuan Li",
            role: "HP MEMBER",
            description: "Through hands-on practice in the iGEM project, I built practical experience in teamwork and multi-stakeholder communication, and came to deeply understand that research projects should connect with real-world social realities. Within the team, my work focused on external communication, while I also took charge of organizing content and materials for the science-education and outreach component, participating in interviews, writing outreach materials, and other concrete tasks for the project."
        },{
            name: "Wanyue Zheng",
            role: "HP MEMBER",
            description: "By joining iGEM, I learned research-project collaboration and Wiki documentation writing, and how to organize tasks and drive work forward through communication under the pressure of multitasking. I was mainly responsible for report writing and HP-related work."
        },{
            name: "Lingxuan Xiang",
            role: "HP MEMBER",
            description: "As a member of the HP group, I was in charge of science outreach and education, and also took part in interviews, data compilation, and sample collection. iGEM made me realize that the power of science lies not only in data but in whether it can be understood by more people. Turning synthetic biology into accessible stories proved far more challenging than expected — and all the more meaningful for it. I learned how to communicate and collaborate, and I felt that the team's cohesion lives in every discussion and every moment of support."
        },{
            name: "Entong Zhu",
            role: "HP MEMBER",
            description: "While working in the HP group, I made many new friends and picked up many new skills. I designed posters and wrote social media posts, and these tasks sharpened my aesthetic sense, my ability to summarize text, and my information-collection skills, among others."
        },{
            name: "Xiran Ma",
            role: "HP MEMBER",
            description: "As a member of the HP group mainly responsible for interviews, copywriting, and video editing, my major in Journalism and Communication helped me deeply appreciate the value of science communication within iGEM. At first, facing topics in fields I had little prior exposure to, I felt intimidated and anxious. But my teammates' patient guidance and encouragement helped me push past my limits step by step, teaching me to converse with people in all kinds of situations and to tell the story of synthetic biology through images."
        },{
            name: "Yiwen Xu",
            role: "HP MEMBER",
            description: "Being part of the IGEM team, in the beginning, feltlike an opportunity for me to showcase my talents.As time passed, I began to realize there was a lotmore to learn in this journey. What challenged memost were the technical questions that arose fromour experimental findings, which kept me up atnight, pondering for an answer. Support from myteam and investigators helped me to navigate it.Presenting our findings to the local teams in IGEMChina helped me assess my ability to communicateffectively."
        },{
            name: "Siyi Zhu",
            role: "ART MEMBER",
            description: "When I first joined the iGEM team, I simply hoped to use this opportunity to pursue my interests. Later, I served as the leader of the art and design group, and this role strengthened my sense of responsibility. Working shoulder to shoulder with our advisor and teammates, we pushed forward various publicity and visual-design tasks together. This experience taught me to balance creative expression with the team's needs, to grow through communication and coordination, and to genuinely feel the fulfillment and joy of contributing to a collective."
        },{
            name: "Xinyue YU",
            role: "ART MEMBER",
            description: "As a member of the iGEM art and design team, I gained a great deal as the project progressed. Design works like a converter, transforming abstract text into visual images. My biggest challenge was turning obscure scientific logic into posters, webpages, and other materials that balanced rigor with aesthetics — and many drafts were reworked again and again. These bright outcomes would not have been possible without teamwork; my teammates' and advisor's research materials and revision feedback were a great help."
        },{
            name: "Ruilin Yang",
            role: "WIKI MEMBER",
            description: "As a member of the iGEM Wiki team, through website design and development as well as mini-program development, I learned to turn ideas into reality step by step, and came to understand more deeply the importance of teamwork and communication. When problems arose, the process of working with teammates to find solutions taught me a great deal."
        },{
            name: "Qimeng Fan",
            role: "DRYLAB MEMBER",
            description: "Participating in iGEM gave me valuable hands-on experience. I helped coordinate the activities of our modeling group, which taught me how to manage team members and communicate efficiently with teammates. Senior members also introduced me to knowledge related to biological modeling, covering protein modeling and data modeling, giving me an initial understanding of basic modeling methods and logic."
        },{
            name: "Mengfei Liu",
            role: "DRYLAB MEMBER",
            description: "Joining the iGEM team was, for me, a perfect opportunity to put theoretical knowledge into practice. As the project progressed, I realized I still had much room to grow. The successive, unexpected data challenges that emerged during the project posed my greatest test, often keeping me up at night as I searched for reasonable explanations. Whenever I got stuck, my teammates and advisor offered invaluable guidance. Sharing results and exchanging ideas with other iGEM teams also greatly strengthened my logical thinking and cross-team communication skills."
        },{
            name: "Yulin Jin",
            role: ">DRYLAB MEMBER",
            description: "As a member of the iGEM modeling group, I initially expected merely to consolidate my skills with modeling tools. Instead, I found myself lacking hands-on experience in combining domain knowledge with data modeling. I learned as I worked on the project, refining the models continuously and discovering the charm of cross-disciplinary collaboration."
        },{
            name: "Yifang Wang",
            role: "ART MEMBER",
            description: "iGEM helped me discover that science is not only rigorous but also full of creativity and warmth. Turning our ideas into works together with my teammates has been a truly wonderful journey."
        },{
            name: "Chanzi Liu",
            role: "WETLAB MEMBER",
            description: "When I first joined the iGEM experimental group, I was eager to bring our bold designs to life in the lab. Yet the road proved far tougher than imagined: countless failed transformations, faint gel bands, and repeatedly fluctuating data, often forcing me to stay by the workbench for long hours troubleshooting. Faced with one disappointing result after another, I felt lost and doubtful of myself. Fortunately, my teammates' companionship and my supervisor's advice let me readjust the plan and keep trying. Every small breakthrough taught me rigor, patience, and the resolve never to give up. This experience not only sharpened my experimental skills but also taught me the resilience a researcher should possess."
        },{
            name: "Jixiang Wang",
            role: "WIKI MEMBER",
            description: "When I first joined the iGEM team, I assumed it would simply be an opportunity to showcase my front-end development and web-animation skills. As the project progressed, I gained far more than technical growth. Working at the intersection of synthetic biology and digital design, I learned to translate complex experimental logic into clear, intuitive web visuals, and understood how refined visualization can help professional scientific content reach and be understood by more people."
        }
    ];
    let lastFocusedMember = null;

    const closeMemberModal = () => {
        if (memberModal.hidden || memberModal.classList.contains("is-closing")) return;

        memberModal.classList.add("is-closing");
        document.body.classList.remove("member-modal-open");
    };

    memberModal.addEventListener("animationend", event => {
        if (event.target !== memberModal || event.animationName !== "member-modal-fade-out") return;

        memberModal.hidden = true;
        memberModal.classList.remove("is-closing");
        if (lastFocusedMember) lastFocusedMember.focus();
    });

    memberContainerList.forEach((memberContainer, index) => {
        memberContainer.tabIndex = 0;
        memberContainer.setAttribute("role", "button");
        memberContainer.setAttribute("aria-label", "View member details");

        const openMemberModal = () => {
            const image = memberContainer.querySelector(".member-img");
            const details = memberDetails[index];

            if (!details) return;

            memberModalImage.src = image.src;
            memberModalImage.alt = image.alt;
            memberModalName.textContent = details.name;
            memberModalRole.textContent = details.role;
            memberModalDescription.textContent = details.description;
            lastFocusedMember = memberContainer;
            memberModal.classList.remove("is-closing");
            memberModal.hidden = false;
            document.body.classList.add("member-modal-open");
            memberModalClose.focus();
        };

        memberContainer.addEventListener("click", openMemberModal);
        memberContainer.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMemberModal();
            }
        });
    });

    memberModal.addEventListener("click", event => {
        if (event.target.matches("[data-member-modal-close]")) closeMemberModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !memberModal.hidden) closeMemberModal();
    });

    const advisorContainerList = document.querySelectorAll(".advisor-container");
    advisorContainerList.forEach(advisorContainer => {
        gsap.from(advisorContainer, {
            opacity: 0,
            clipPath: "inset(0 0 100% 0)",
            duration: 1,
            ease: "power1.out",
            scrollTrigger: {
                trigger: advisorContainer,
                start: "top 75%",
                once: true
            }
        });
    })

    // 图片悬停效果
    gsap.utils.toArray(".leader-img, .advisor-img, .member-img").forEach((image) => {
        const container = image.closest(
            ".leader-img-container, .advisor-img-container, .member-img-container"
        );

        if (!container) return;

        container.addEventListener("mouseenter", () => {
            gsap.to(image, {
                scale: 1.06,
                filter: "brightness(1.12) saturate(1.15)",
                duration: 0.45,
                ease: "power2.out"
            });
        });

        container.addEventListener("mouseleave", () => {
            gsap.to(image, {
                scale: 1,
                filter: "brightness(1) saturate(1)",
                duration: 0.45,
                ease: "power2.out"
            });
        });
    });

    ScrollTrigger.refresh();
})();