# 🌟 Fandom-K

**Fandom-K** is a web platform created for K-pop fans, focusing on interactive fan activities and immersive voting experiences. This project aims to deliver a modern landing experience with beautiful animations and responsive layouts.

---

## ✨ My Role

- 🎨 Implemented a fully responsive landing page using React and SCSS
- 🧩 Modularized layout into reusable components to reduce repetition and improve maintainability
- 🎞 Applied Framer Motion animations for a dynamic and engaging user experience
- 📣 Presented the project in final team presentation

---

## 🔧 Tools Used

- VS Code  
- Prettier  
- React  
- SCSS  
- GitHub  
- Notion  

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
