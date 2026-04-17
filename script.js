const sections = [...document.querySelectorAll(".slide")];
const dotLinks = [...document.querySelectorAll(".dot-link")];

const startButton = document.getElementById("startButton");
if (startButton) {
  startButton.addEventListener("click", () => {
    document.getElementById("toc")?.scrollIntoView({ behavior: "smooth" });
  });
}

document.querySelectorAll(".tabs").forEach((tabGroup) => {
  const tabs = [...tabGroup.querySelectorAll(".tab")];
  const card = tabGroup.closest(".essay-card");
  const panels = card ? [...card.querySelectorAll(".tab-panel")] : [];

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
      });
      panels.forEach((panel) => panel.classList.remove("active"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const target = card?.querySelector(`#${tab.dataset.panel}`);
      if (target) target.classList.add("active");
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".fade-in").forEach((item) => revealObserver.observe(item));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      dotLinks.forEach((link) => link.classList.remove("active"));
      const activeDot = dotLinks.find((link) => link.dataset.section === entry.target.id);
      if (activeDot) activeDot.classList.add("active");
    });
  },
  { threshold: 0.6 }
);

sections.forEach((section) => navObserver.observe(section));
