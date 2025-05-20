# 🌟 Fandom-K

**Fandom-K** is a web platform created for K-pop fans, focusing on interactive fan activities and immersive voting experiences. This project aims to deliver a modern landing experience with beautiful animations and responsive layouts.

---

## ✨ My Role

- 🎨 Implemented a fully responsive landing page using React and SCSS  
- 🧩 Modularized layout into reusable components to reduce repetition and improve maintainability  
- 🎞 Applied Framer Motion animations for a dynamic and engaging user experience  
- 📣 Presented the project in final team presentation  

---

## 🛠 Tech Stack

<img alt="React" src="https://img.shields.io/badge/React-61DAFB?&style=for-the-badge&logo=React&logoColor=white"/>  
<img alt="Sass" src="https://img.shields.io/badge/Sass-CC6699?&style=for-the-badge&logo=Sass&logoColor=white"/>  
<img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-EF6C00?&style=for-the-badge&logo=framer&logoColor=white"/>  
<img alt="VS Code" src="https://img.shields.io/badge/VS%20Code-007ACC?&style=for-the-badge&logo=Visual%20Studio%20Code&logoColor=white"/>  
<img alt="Prettier" src="https://img.shields.io/badge/Prettier-F7B93E?&style=for-the-badge&logo=Prettier&logoColor=black"/>  
<img alt="GitHub" src="https://img.shields.io/badge/GitHub-181717?&style=for-the-badge&logo=GitHub&logoColor=white"/>  
<img alt="Notion" src="https://img.shields.io/badge/Notion-000000?&style=for-the-badge&logo=Notion&logoColor=white"/>  

---

## 📐 Component Design Strategy

The component-based architecture helped eliminate repetitive code and significantly enhanced maintainability and reusability. I used props to dynamically inject content into each section, enabling scalable layout composition.

---

## 🎥 Framer Motion Animation Details

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false }}
  transition={{ ease: "easeInOut", duration: 2 }}
>
  ...
</motion.div>
