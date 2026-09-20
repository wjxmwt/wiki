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
            type: 'words'
        });
        gsap.from(splitDesc.words, {
            rotationX: -100,
            transformOrigin: "50% 50% -160px",
            opacity: 0,
            duration: 1,
            ease: "power3",
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
            name: "Jiaze Sun",
            role: "WETLAB MEMBER",
            description: "When I first joined the iGEM team, I had only a vague impression of what it involved and was mainly drawn to its innovative nature. However, as I became immersed in hands-on work, I discovered the discipline and dedication behind every successful experiment. From preparing materials and carefully recording results to repeating failed trials, I developed a stronger sense of responsibility and learned that meaningful scientific progress comes from persistent, careful, and meticulous work. "
        },{
            name: "Chanzi Liu",
            role: "WETLAB MEMBER",
            description: "When I first joined the iGEM experimental group, I was eager to bring our bold designs to life in the laboratory. Yet the journey proved far more challenging than I had imagined, with countless failed transformations, faint gel bands, and inconsistent data that often kept me at the workbench for long hours troubleshooting. Faced with one disappointing result after another, I sometimes felt lost and began to doubt myself. Fortunately, the support of my teammates and guidance from my supervisor helped me adjust our approach and keep moving forward. Every small breakthrough taught me the importance of rigor, patience, and perseverance. This experience not only strengthened my experimental skills but also taught me the resilience and determination that are essential for a researcher."
        },
        {
            name: "Feier Yi",
            role: "HP LEADER",
            description: "iGEM equipped me with the ability to let the engineering cycle guide my practice, moving steadily toward our goals through implementation, feedback, and iterative optimization, while growing together with friendly competition partners."
        },{
            name: "Yiwen Xu",
            role: "HP MEMBER",
            description: "Being part of the IGEM team, in the beginning, feltlike an opportunity for me to showcase my talents.As time passed, I began to realize there was a lotmore to learn in this journey. What challenged memost were the technical questions that arose fromour experimental findings, which kept me up atnight, pondering for an answer. Support from myteam and investigators helped me to navigate it.Presenting our findings to the local teams in IGEMChina helped me assess my ability to communicateffectively."
        },
        {
            name: "Yunyuan Li",
            role: "HP MEMBER",
            description: "Through hands-on experience in the iGEM project, I developed practical skills in teamwork and communication with multiple stakeholders. I also came to understand the importance of connecting research projects with real-world social needs and challenges. Within the team, my work focused primarily on external communication. Taking responsibility for organizing content and materials for the science education and outreach component, participating in interviews, writing outreach materials, and contributing to other project-related activities significantly strengthened my practical skills and communication abilities."
        },{
            name: "Wanyue Zheng",
            role: "HP MEMBER",
            description: "Learning how to collaborate on a research project, write and organize Wiki documentation, manage tasks, and move work forward through effective communication while handling multiple responsibilities was a major takeaway for me. Writing reports and contributing to Human Practices (HP) activities also gave me a strong sense of purpose and value, helping me recognize the broader impact of our research beyond the laboratory."
        },{
            name: "Lingxuan Xiang",
            role: "HP MEMBER",
            description: "Being responsible for science outreach and education, while also participating in interviews, data compilation, and sample collection, gave me a different perspective and valuable exposure to the broader aspects of scientific research. iGEM made me realize that the power of science lies not only in the data it produces, but also in how effectively that knowledge can be understood and shared with others. Turning synthetic biology into accessible and engaging stories proved far more challenging than I had expected—and all the more meaningful because of it. Through this experience, I learned how to communicate and collaborate more effectively, and I came to appreciate that the team’s cohesion is built through every discussion, every shared challenge, and every moment of support."
        },{
            name: "Entong Zhu",
            role: "HP MEMBER",
            description: "iGEM helped me build new friendships and develop many new skills. Designing posters and writing social media posts sharpened my aesthetic sense, strengthened my ability to summarize information effectively, and improved my skills in collecting and organizing information. Beyond these practical skills, the experience also taught me how to communicate ideas creatively and connect with a wider audience."
        },{
            name: "Xiran Ma",
            role: "HP MEMBER",
            description: "As a member of the Human Practices (HP) group, I was mainly responsible for conducting interviews, writing copy, and editing videos. My background in Journalism and Communication helped me deeply appreciate the importance of science communication within iGEM. At first, I felt intimidated and anxious when faced with scientific topics to which I had little prior exposure. However, the patient guidance and encouragement of my teammates helped me gradually push beyond my comfort zone. Through this experience, I learned how to communicate with people from different backgrounds and situations, and how to tell the story of synthetic biology through compelling visual content."
        },{
            name: "Siyi Zhu",
            role: "ART LEADER",
            description: "When I first joined the iGEM team, I simply hoped to use the opportunity to pursue my interests. Later, I became the leader of the art and design group, a role that strengthened my sense of responsibility. Working closely with our advisor and teammates, we collaborated on various publicity and visual-design tasks and worked together to move our projects forward. This experience taught me how to balance creative expression with the needs of the team, grow through communication and coordination, and genuinely appreciate the fulfillment and joy that come from contributing to a collective effort."
        },
        {
            name: "Yuhan Hu",
            role: "ART MEMBER",
            description: "As a member of the iGEM art and design group, I worked on visual materials including the team logo, mascot, and presentation slides. This experience helped me understand the universal language of visual communication and taught me how to present complex research ideas through creative and engaging visuals. It was a journey of learning how design can bridge the gap between scientific research and the wider world.  "
        },{
            name: "Xinyue Yu",
            role: "ART MEMBER",
            description: "As a member of the iGEM art and design team, I gained valuable experience throughout the project. I came to see design as a bridge that transforms abstract ideas and complex scientific concepts into clear and engaging visual communication. One of my biggest challenges was translating complex scientific concepts into posters, webpages, and other materials that balanced scientific rigor with visual appeal. Many of these designs went through multiple rounds of revision and refinement. These outcomes would not have been possible without teamwork; the research materials and constructive feedback provided by my teammates and advisor were invaluable in helping me improve my work."
        },
        {
            name: "Linying Lan",
            role: "ART MEMBER",
            description: "Stepping into the world of iGEM made me realize that science requires not only rigorous experimentation but also a compelling voice. As a team member, I committed myself to transforming complex research outcomes into visual narratives that could communicate scientific ideas to a wider audience. Through countless rounds of revision and reflection, I learned how to build bridges of communication through design, making scientific stories more accessible and understandable to everyone."
        },{
            name: "Yifang Wang",
            role: "ART MEMBER",
            description: "iGEM helped me discover that science is not only rigorous but also filled with creativity and human connection. Bringing our ideas to life together with my teammates has been a truly meaningful and rewarding journey."
        },
        {
            name: "Minxi Qiu",
            role: "WIKI LEADER",
            description: "As a beginner in web design, I initially thought, the Wiki was simply a platform for presenting our results online. However, after joining iGEM and gaining hands-on experience, I discovered the many details that required careful attention and refinement. Technical challenges such as responsive layout design, content rendering, and formatting standards often required me to debug, troubleshoot, and revise my work repeatedly. Participating in iGEM strengthened my cross-disciplinary collaboration and communication skills, familiarized me with iGEM’s Wiki standards, and enhanced my ability to communicate scientific information effectively. It also deepened my understanding of teamwork, task division, and the importance of coordinating with members from different disciplines."
        },{
            name: "Ruilin Yang",
            role: "WIKI MEMBER",
            description: "As a member of the iGEM Wiki team, I worked on website design and development as well as mini-program development. Through these experiences, I learned how to turn ideas into reality step by step and gained a deeper understanding of the importance of teamwork and communication. Whenever problems arose, working closely with my teammates to identify solutions and overcome challenges taught me a great deal about collaboration, problem-solving, and perseverance."
        },{
            name: "Jixiang Wang",
            role: "WIKI MEMBER",
            description: "When I first joined the iGEM team, I assumed it would simply be an opportunity to showcase my front-end development and web animation skills. As the project progressed, however, I gained far more than technical experience. Working at the intersection of synthetic biology and digital design, I learned to translate complex experimental concepts and logic into clear, intuitive web visuals. I also came to understand how thoughtful visualization can make complex scientific content more accessible and help it reach a wider audience."
        },{
            name: "Qimeng Fan",
            role: "DRYLAB LEADER",
            description: "Participating in iGEM gave me valuable hands-on experience. I helped coordinate the activities of our modeling group, which taught me how to coordinate team members and communicate effectively with my teammates. Senior members also introduced me to biological modeling, including protein modeling and data modeling, giving me an initial understanding of fundamental modeling methods and the underlying logic behind them."
        },{
            name: "Mengfei Liu",
            role: "DRYLAB MEMBER",
            description: "Joining the iGEM team was, for me, a perfect opportunity to put theoretical knowledge into practice. As the project progressed, I realized I still had much room to grow. The successive, unexpected data challenges that emerged during the project posed my greatest test, often keeping me up at night as I searched for reasonable explanations. Whenever I got stuck, my teammates and advisor offered invaluable guidance. Sharing results and exchanging ideas with other iGEM teams also greatly strengthened my logical thinking and cross-team communication skills."
        },{
            name: "Yulin Jin",
            role: ">DRYLAB MEMBER",
            description: "As a member of the iGEM modeling group, I initially expected to strengthen my skills in using modeling tools. However, I soon realized that I lacked hands-on experience in integrating domain knowledge with data modeling. Through working on the project, I learned by doing, continuously refining our models and gaining a deeper understanding of how theoretical knowledge can be applied in practice. This experience also allowed me to discover the value and potential of cross-disciplinary collaboration."
        }
    ];
    const teacherDetails = [
        {
            name: "Nisha He",
            role: "PRIMARY PI",
            description: "Nisha He is an associate professor and master’s supervisor at Hubei University. Her research focuses on molecular enzymology, biosensing and enzyme engineering. She guides the design and experimental scheme of the whole-cell biosensor in our project."
        },{
            name: "Jonathan Nimal",
            role: "SECONDARY PI",
            description: "Jonathan Nimal is a foreign expert at Hubei University, specializing in academic writing and scientific communication. He supports our team on English materials, international presentation and iGEM defense."
        },{
            name: "Haimou Zhang",
            role: "SECONDARY PI",
            description: "Haimou Zhang is a professor and doctoral supervisor at Hubei University, focusing on environmental toxicology and biology education. He has long supervised the HUBU-China iGEM team and guided our pollutant detection project."
        },{
            name: "Zhifan Yang",
            role: "SECONDARY PI",
            description: "Zhifan Yang is a professor and doctoral supervisor at Hubei University, whose research focuses on molecular biology and synthetic biology. He has long served as the supervisor of the HUBU-China iGEM team and supported innovative synthetic biology projects."
        },{
            name: "Jiaqi Wang",
            role: "Advisor",
            description: "Jiaqi Wang is an alumnus of the School of Life Sciences, Hubei University. He has rich experience in synthetic biology competitions and research. He supports our project on experimental design and iGEM preparation based on his previous competition experience."
        },{
            name: "Pan Wu",
            role: "Instructor",
            description: "Pan Wu is an associate professor and master’s supervisor at Hubei University. His research focuses on biodegradation of persistent toxic pollutants and molecular modification of industrial enzymes. He guides the construction of PAH-degrading strains and whole-cell biosensors in our project."
        }
    ]
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

    const advisorContainerList = document.querySelectorAll(".advisor-container");
    advisorContainerList.forEach((advisorContainer, index) => {
        advisorContainer.tabIndex = 0;
        advisorContainer.setAttribute("role", "button");
        advisorContainer.setAttribute("aria-label", "View teacher details");

        const openAdvisorModal = () => {
            const image = advisorContainer.querySelector(".advisor-img");
            const details = teacherDetails[index];

            if (!details) return;

            memberModalImage.src = image.src;
            memberModalImage.alt = image.alt;
            memberModalName.textContent = details.name;
            memberModalRole.textContent = details.role;
            memberModalDescription.textContent = details.description;
            lastFocusedMember = advisorContainer;
            memberModal.classList.remove("is-closing");
            memberModal.hidden = false;
            document.body.classList.add("member-modal-open");
            memberModalClose.focus();
        };

        advisorContainer.addEventListener("click", openAdvisorModal);
        advisorContainer.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openAdvisorModal();
            }
        });
    });

    memberModal.addEventListener("click", event => {
        if (event.target.matches("[data-member-modal-close]")) closeMemberModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !memberModal.hidden) closeMemberModal();
    });

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