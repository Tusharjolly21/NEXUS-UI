# Context Menu

Add the "Context Menu" component from Nexus UI to my project.

The right-click menu, made of liquid. Right-click a file, or press and hold on a phone, or press Shift+F10, and a drop forms under the pointer and flows out into the menu while the drop is absorbed. The highlight glides from row to row, and Move To buds a submenu off the side that snaps free like a droplet. Every action works: rename in place, duplicate, copy a link, pin to the top, favourite, tag, move into a folder (the file flies in and the folder bounces) or move to Trash with Undo. On close the menu drains back into the point it came from. Arrow keys, Enter and Escape work throughout. Until you touch it, it plays a few right-clicks by itself. Also includes Desktop Context Menu, a vibrancy menu that springs out of the exact point you right-click on a desktop at dusk, with a sliding highlight, submenus that wait for you, and rename, share, tags and delete with Undo.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ContextMenu } from "@/components/context-menu/context-menu";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/context-menu/context-menu.tsx ---

```tsx
"use client";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  pencil: "<path fill=\"currentColor\" d=\"m43.293 16.926l2.367-2.32c1.196-1.196 1.242-2.485.188-3.563l-.797-.797c-1.055-1.055-2.344-.937-3.54.211l-2.367 2.344ZM15.66 44.488l25.57-25.547l-4.101-4.125l-25.594 25.57L9.31 45.59c-.211.562.375 1.219.937.984Z\"/>",
  doc_on_doc: "<path fill=\"currentColor\" d=\"M11.505 56h21.4c4.561 0 6.721-2.314 6.721-6.92v-4.077h4.298c4.54 0 6.81-2.314 6.81-6.92V19.636c0-2.71-.53-4.43-2.182-6.126L37.422 2.182C35.836.573 34.006 0 31.648 0h-9.013c-4.54 0-6.833 2.314-6.833 6.92v4.077h-4.297c-4.54 0-6.832 2.314-6.832 6.92V49.08c0 4.628 2.292 6.92 6.832 6.92m28.121-24.683c0-2.821-.33-4.055-2.093-5.863L25.389 13.092c-1.675-1.72-3.063-2.094-5.553-2.094h-.485V6.964c0-2.16 1.19-3.416 3.46-3.416h9.3v11.526c0 2.535 1.256 3.769 3.769 3.769h11.306v19.196c0 2.181-1.169 3.416-3.46 3.416h-4.1Zm-3.217-15.67c-.794 0-1.102-.33-1.102-1.101V4.253l11.195 11.394ZM11.68 52.452c-2.27 0-3.46-1.234-3.46-3.438V17.96c0-2.16 1.19-3.415 3.482-3.415h7.648v12.782c0 2.777 1.41 4.143 4.143 4.143h12.584v17.543c0 2.204-1.19 3.438-3.482 3.438Zm12.232-24.309c-.882 0-1.234-.352-1.234-1.212V15.23l12.716 12.914Z\"/>",
  link: "<path fill=\"currentColor\" d=\"m27.707 37.656l3.117-3.164c-3.093-.234-5.109-1.172-6.632-2.695c-4.102-4.102-4.079-9.914-.024-13.969l7.64-7.64c4.102-4.079 9.868-4.102 13.946 0c4.125 4.101 4.078 9.89.024 13.945l-4.594 4.594c.656 1.5.797 3.234.562 4.757l6.867-6.867c5.626-5.625 5.672-13.57-.023-19.265s-13.64-5.649-19.266-.024l-7.992 8.016c-5.625 5.625-5.672 13.594.024 19.265c1.476 1.477 3.351 2.532 6.351 3.047m.586-19.312l-3.117 3.164c3.094.258 5.11 1.172 6.633 2.695c4.101 4.102 4.078 9.914.023 13.969l-7.664 7.64c-4.078 4.079-9.867 4.102-13.945.024c-4.102-4.125-4.078-9.89 0-13.969l4.593-4.594c-.656-1.476-.82-3.234-.585-4.757l-6.868 6.867c-5.601 5.625-5.648 13.594.024 19.265c5.695 5.696 13.664 5.649 19.266.047l8.015-8.039c5.625-5.625 5.672-13.593-.023-19.265c-1.477-1.477-3.352-2.532-6.352-3.047\"/>",
  folder: "<path fill=\"currentColor\" d=\"M8.453 49.75h39.82c4.195 0 6.633-2.437 6.633-7.266v-24.68c0-4.827-2.46-7.241-7.336-7.241H24.766c-1.594 0-2.555-.399-3.727-1.383l-1.43-1.196c-1.547-1.289-2.742-1.734-5.062-1.734H7.562c-4.101 0-6.468 2.344-6.468 7.078v29.156c0 4.852 2.484 7.266 7.359 7.266M4.867 13.516c0-2.32 1.242-3.492 3.469-3.492h5.25c1.547 0 2.484.374 3.68 1.406l1.43 1.172c1.523 1.265 2.765 1.734 5.085 1.734H47.5c2.32 0 3.633 1.242 3.633 3.68v1.406H4.867Zm3.656 32.46c-2.343 0-3.656-1.242-3.656-3.68V22.962h46.266v19.36c0 2.413-1.313 3.656-3.633 3.656Z\"/>",
  folder_fill: "<path fill=\"currentColor\" d=\"M47.57 10.563H24.766c-1.594 0-2.555-.399-3.727-1.383l-1.43-1.196c-1.547-1.289-2.742-1.734-5.062-1.734H7.562c-4.101 0-6.468 2.344-6.468 7.078v6.258h53.812v-1.781c0-4.828-2.46-7.242-7.336-7.242M8.453 49.75h39.82c4.195 0 6.633-2.437 6.633-7.266v-19.71H1.094v19.71c0 4.852 2.484 7.266 7.359 7.266\"/>",
  pin: "<path fill=\"currentColor\" d=\"M13.422 35.969h12.516v12.047c0 3.562 1.5 6.562 2.085 6.562c.563 0 2.063-3 2.063-6.562V35.969h12.492c1.617 0 2.79-1.032 2.79-2.602c0-.984-.306-1.687-.985-2.414l-7.172-7.781c-.492-.516-.797-.89-.68-1.852l1.196-8.554c.07-.492.117-.774.562-1.078l5.742-4.172c1.29-.938 1.852-2.086 1.852-3.141c0-1.57-1.266-2.953-3.07-2.953H13.186c-1.804 0-3.07 1.383-3.07 2.953c0 1.055.563 2.203 1.828 3.14l5.766 4.173c.445.304.492.585.562 1.078l1.196 8.554c.14.961-.188 1.336-.68 1.852l-7.172 7.781c-.68.727-.984 1.43-.984 2.414c0 1.57 1.172 2.602 2.789 2.602m3.047-3.774c-.211 0-.352-.14-.352-.351c0-.14.094-.282.211-.399l6-6.28c.774-.774 1.078-1.618.985-2.485l-1.454-11.297c-.117-.914-.422-1.594-1.101-2.063l-5.086-3.375c-.164-.117-.211-.234-.211-.398c0-.211.164-.352.375-.352h24.328c.211 0 .375.14.375.352c0 .164-.047.281-.21.398L35.241 9.32c-.68.47-.984 1.149-1.101 2.063L32.688 22.68c-.094.867.21 1.71.96 2.484l6.024 6.281a.58.58 0 0 1 .187.399c0 .21-.117.351-.328.351Z\"/>",
  pin_fill: "<path fill=\"currentColor\" d=\"M14.254 35.969h11.695v12.047c0 3.562 1.477 6.562 2.063 6.562s2.062-3 2.062-6.562V35.969h11.672c1.617 0 2.79-1.032 2.79-2.602c0-.984-.306-1.687-.985-2.414l-7.172-7.781c-.492-.516-.797-.89-.68-1.852l1.196-8.554c.07-.492.117-.774.539-1.078l5.765-4.172c1.29-.938 1.852-2.086 1.852-3.141c0-1.57-1.266-2.953-3.07-2.953H14.02c-1.805 0-3.07 1.383-3.07 2.953c0 1.055.562 2.203 1.827 3.14l5.766 4.173c.445.304.492.585.562 1.078l1.196 8.554c.117.961-.188 1.336-.68 1.852l-7.172 7.781c-.68.727-.984 1.43-.984 2.414c0 1.57 1.172 2.602 2.789 2.602\"/>",
  star: "<path fill=\"currentColor\" d=\"M11.969 52.293c.96.727 2.18.469 3.633-.586L28 42.613l12.422 9.094c1.453 1.055 2.648 1.313 3.633.586c.96-.727 1.172-1.922.586-3.633l-4.899-14.578l12.516-9c1.453-1.031 2.039-2.11 1.664-3.281c-.375-1.125-1.477-1.688-3.281-1.664l-15.352.093l-4.664-14.648C30.063 3.848 29.22 2.981 28 2.981c-1.195 0-2.039.867-2.602 2.601L20.734 20.23l-15.351-.093c-1.805-.024-2.906.539-3.281 1.664c-.399 1.172.21 2.25 1.664 3.281l12.515 9l-4.898 14.578c-.586 1.711-.375 2.906.586 3.633m3.375-4.64c-.047-.047-.024-.071 0-.212l4.664-13.406c.305-.914.14-1.64-.68-2.203L7.656 23.77c-.117-.07-.14-.118-.117-.188s.07-.07.211-.07l14.18.258c.96.023 1.57-.375 1.875-1.336l4.055-13.57c.046-.141.093-.188.14-.188c.07 0 .117.047.14.187l4.079 13.57c.281.962.914 1.36 1.875 1.337l14.18-.258c.14 0 .187 0 .21.07c.024.07-.023.117-.117.188l-11.672 8.062c-.82.563-1.007 1.29-.68 2.203l4.665 13.406c.023.141.047.164 0 .211c-.047.07-.117.024-.211-.047l-11.274-8.601c-.75-.586-1.617-.586-2.367 0l-11.273 8.602c-.094.07-.164.117-.211.046\"/>",
  star_fill: "<path fill=\"currentColor\" d=\"M11.969 52.293c.96.727 2.18.469 3.633-.586L28 42.613l12.422 9.094c1.453 1.055 2.648 1.313 3.633.586c.96-.727 1.172-1.922.586-3.633l-4.899-14.578l12.516-9c1.453-1.031 2.039-2.11 1.664-3.281c-.375-1.125-1.477-1.688-3.281-1.664l-15.352.093l-4.664-14.648C30.063 3.848 29.22 2.981 28 2.981c-1.195 0-2.039.867-2.602 2.601L20.734 20.23l-15.351-.093c-1.805-.024-2.906.539-3.281 1.664c-.399 1.172.21 2.25 1.664 3.281l12.515 9l-4.898 14.578c-.586 1.711-.375 2.906.586 3.633\"/>",
  trash: "<path fill=\"currentColor\" d=\"m44.524 48.66l1.617-34.265h2.343c.961 0 1.735-.797 1.735-1.758s-.774-1.782-1.735-1.782H38.242V7.34c0-3.352-2.273-5.531-5.882-5.531h-8.766c-3.61 0-5.86 2.18-5.86 5.53v3.516H7.54c-.937 0-1.758.82-1.758 1.782c0 .96.82 1.758 1.758 1.758h2.344L11.5 48.684c.164 3.375 2.39 5.507 5.766 5.507h21.492c3.351 0 5.601-2.156 5.765-5.53M21.484 7.574c0-1.336.985-2.273 2.391-2.273h8.227c1.43 0 2.414.937 2.414 2.273v3.281H21.484Zm-3.867 43.102c-1.36 0-2.367-1.032-2.437-2.39l-1.64-33.891h28.85l-1.546 33.89c-.07 1.383-1.055 2.39-2.438 2.39Zm17.344-4.125c.773 0 1.36-.633 1.383-1.524l.703-24.75c.023-.89-.586-1.547-1.383-1.547c-.726 0-1.336.68-1.36 1.524l-.702 24.773c-.024.844.562 1.524 1.359 1.524m-13.898 0c.797 0 1.382-.68 1.359-1.524l-.703-24.773c-.024-.844-.656-1.524-1.383-1.524c-.797 0-1.383.657-1.36 1.547l.727 24.75c.024.891.586 1.524 1.36 1.524m8.367-1.524V20.254c0-.844-.633-1.524-1.407-1.524c-.773 0-1.43.68-1.43 1.524v24.773c0 .844.657 1.524 1.43 1.524c.75 0 1.407-.68 1.407-1.524\"/>",
  chevron_right: "<path fill=\"currentColor\" d=\"M18.695 48.367c.586 0 1.102-.234 1.524-.633L38.78 29.57c.446-.445.68-.984.68-1.57c0-.61-.234-1.172-.68-1.57L20.22 8.289a2.07 2.07 0 0 0-1.524-.656a2.12 2.12 0 0 0-2.156 2.156c0 .563.258 1.125.633 1.524L34.21 28L17.17 44.688c-.374.398-.632.937-.632 1.523c0 1.219.938 2.156 2.156 2.156\"/>",
  doc_text_fill: "<path fill=\"currentColor\" d=\"M15.555 53.125h24.89c4.852 0 7.266-2.461 7.266-7.336V24.508H30.742c-3 0-4.406-1.43-4.406-4.43V2.875H15.555c-4.828 0-7.266 2.484-7.266 7.36v35.554c0 4.898 2.438 7.336 7.266 7.336m15.258-31.828h16.64c-.164-.961-.844-1.899-1.945-3.047L32.57 5.102c-1.078-1.125-2.062-1.805-3.047-1.97v16.9c0 .843.446 1.265 1.29 1.265m-11.836 13.36c-.961 0-1.641-.68-1.641-1.594c0-.915.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.593c0 .915-.727 1.594-1.664 1.594Zm0 8.929c-.961 0-1.641-.68-1.641-1.594s.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.594s-.727 1.594-1.664 1.594Z\"/>",
  doc_chart_fill: "<path fill=\"currentColor\" d=\"M26.336 2.88v17.203c0 3 1.406 4.43 4.406 4.43h16.969v21.281c0 4.875-2.414 7.336-7.266 7.336h-24.89c-4.828 0-7.266-2.437-7.266-7.336V10.239c0-4.875 2.438-7.359 7.266-7.359zm-8.21 30.055h-1.563c-.863 0-1.563.7-1.563 1.563v10.94C15 46.3 15.7 47 16.563 47h1.563c.863 0 1.562-.7 1.562-1.563v-10.94c0-.862-.7-1.562-1.562-1.562m7.032-4.688h-1.563c-.863 0-1.562.7-1.562 1.562v15.628c0 .863.7 1.563 1.562 1.563h1.563c.863 0 1.563-.7 1.563-1.563V29.81c0-.863-.7-1.562-1.563-1.562m7.033 9.376h-1.563c-.863 0-1.563.7-1.563 1.563v6.251c0 .863.7 1.563 1.563 1.563h1.563c.863 0 1.562-.7 1.562-1.563v-6.25c0-.864-.7-1.564-1.562-1.564M29.523 3.138c.985.164 1.97.844 3.047 1.969l12.938 13.148c1.101 1.148 1.781 2.086 1.945 3.047h-16.64c-.844 0-1.29-.422-1.29-1.266Z\"/>",
  photo_fill: "<path fill=\"currentColor\" d=\"M7.715 49.574h40.57c4.899 0 7.36-2.437 7.36-7.265V13.69c0-4.828-2.461-7.265-7.36-7.265H7.715C2.84 6.426.355 8.84.355 13.69v28.62c0 4.851 2.485 7.265 7.36 7.265m10.218-21c-3.187 0-5.789-2.601-5.789-5.789c0-3.164 2.602-5.789 5.79-5.789c3.164 0 5.765 2.625 5.765 5.79c0 3.187-2.601 5.788-5.766 5.788M7.762 45.801c-2.25 0-3.633-1.36-3.633-3.657v-1.43l7.195-6.28c1.031-.914 2.156-1.383 3.211-1.383c1.125 0 2.32.469 3.352 1.43l4.5 4.03l11.18-9.937c1.171-1.031 2.46-1.5 3.773-1.5c1.289 0 2.625.492 3.75 1.524l10.78 9.984v3.61c0 2.25-1.405 3.609-3.632 3.609Z\"/>",
  film_fill: "<path fill=\"currentColor\" d=\"M6.883 49.574h42.234c4.524 0 6.774-2.226 6.774-6.68V13.107c0-4.454-2.25-6.68-6.774-6.68H6.883c-4.477 0-6.774 2.226-6.774 6.68v29.789c0 4.453 2.274 6.68 6.774 6.68m.047-3.773c-1.969 0-3.047-1.032-3.047-3.094V13.293c0-2.062 1.101-3.094 3.047-3.094h42.14c1.97 0 3.047 1.031 3.047 3.094v29.414c0 2.063-1.078 3.094-3.047 3.094Zm.094-30.164c0 .515.398.937 1.03.937h2.18c.586 0 .985-.422.985-.937V13.67c0-.633-.399-1.031-.985-1.031h-2.18c-.656 0-1.03.398-1.03 1.031Zm37.78 0c0 .515.376.937 1.008.937h2.18c.586 0 .985-.422.985-.937V13.67c0-.633-.399-1.031-.985-1.031h-2.18c-.656 0-1.008.398-1.008 1.031Zm-30.187 9.492c0 .703.445 1.125 1.149 1.125h24.492c.703 0 1.125-.422 1.125-1.125v-11.25c0-.703-.422-1.125-1.125-1.125H15.766c-.703 0-1.149.422-1.149 1.125Zm-7.594-2.813c0 .54.399.961 1.032.961h2.18c.585 0 .984-.422.984-.96v-1.97c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.03.398-1.03 1.008Zm37.782 0c0 .54.375.961 1.008.961h2.18c.585 0 .984-.422.984-.96v-1.97c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.008.398-1.008 1.008ZM7.023 29.02c0 .515.398.937 1.03.937h2.18c.586 0 .985-.422.985-.937v-1.993c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.03.398-1.03 1.007Zm37.78 0c0 .515.376.937 1.008.937h2.18c.586 0 .985-.422.985-.937v-1.993c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.008.398-1.008 1.007ZM14.617 42.098c0 .726.445 1.125 1.149 1.125h24.492c.703 0 1.125-.399 1.125-1.125v-11.18c0-.703-.422-1.102-1.125-1.102H15.766c-.703 0-1.149.399-1.149 1.102Zm-7.594-6.399c0 .516.399.961 1.032.961h2.18a.956.956 0 0 0 .984-.96v-1.97c0-.632-.399-1.03-.985-1.03h-2.18c-.656 0-1.03.398-1.03 1.03Zm37.782 0c0 .516.375.961 1.008.961h2.18a.956.956 0 0 0 .984-.96v-1.97c0-.632-.399-1.03-.985-1.03h-2.18c-.656 0-1.008.398-1.008 1.03ZM7.023 42.38c0 .539.398.96 1.03.96h2.18c.586 0 .985-.421.985-.96v-1.992c0-.586-.399-.985-.985-.985h-2.18c-.656 0-1.03.399-1.03.985Zm37.78 0c0 .539.376.96 1.008.96h2.18c.586 0 .985-.421.985-.96v-1.992c0-.586-.399-.985-.985-.985h-2.18c-.656 0-1.008.399-1.008.985Z\"/>",
  arrow_uturn_left: "<path fill=\"currentColor\" d=\"M50.148 34.914c0-8.953-6.046-15.14-16.757-15.14H17.664l-5.508.257l4.454-3.797l6.75-6.609c.374-.375.562-.82.562-1.43c0-1.218-.82-2.062-2.062-2.062c-.516 0-1.126.258-1.524.656L6.555 20.312c-.469.446-.703.985-.703 1.57c0 .563.234 1.102.703 1.548l13.781 13.523a2.2 2.2 0 0 0 1.524.656c1.242 0 2.062-.843 2.062-2.062c0-.61-.188-1.055-.562-1.43l-6.75-6.586l-4.454-3.797l5.508.235h16.078c7.992 0 12.235 4.406 12.235 10.71c0 6.329-4.243 11.016-12.235 11.016h-5.39c-1.29 0-2.133.938-2.133 2.086c0 1.149.844 2.086 2.133 2.086h5.414c10.5 0 16.382-5.976 16.382-14.953\"/>",
  checkmark: "<path fill=\"currentColor\" d=\"M23.078 48.027c1.008 0 1.805-.445 2.367-1.312L47.594 11.84c.422-.68.61-1.195.61-1.735c0-1.289-.868-2.132-2.157-2.132c-.914 0-1.453.304-2.016 1.195L22.984 42.707L12.062 28.41c-.585-.82-1.148-1.148-2.015-1.148c-1.313 0-2.25.914-2.25 2.203c0 .539.234 1.148.68 1.71L20.64 46.669c.726.914 1.43 1.36 2.437 1.36\"/>",
  cursor_rays: "<path fill=\"currentColor\" d=\"M30.04 4.797c0-1.102-.938-2.04-2.04-2.04s-2.039.938-2.039 2.04v6.844c0 1.101.938 2.039 2.04 2.039c1.1 0 2.038-.938 2.038-2.04Zm-15.376 12.96c.774.798 2.086.798 2.883 0c.773-.773.773-2.085 0-2.882l-4.805-4.828c-.773-.774-2.086-.797-2.883-.024c-.773.774-.773 2.086 0 2.883Zm23.531-2.648c-.773.797-.773 2.11 0 2.883c.797.797 2.11.797 2.907 0l4.828-4.828a2.066 2.066 0 0 0 0-2.906c-.774-.774-2.086-.774-2.883 0ZM40 50.852l-4.64-10.829l5.953.329c.96.046 1.43-.985.75-1.688L27.766 24.062c-.633-.656-1.57-.304-1.617.633l-.258 20.297c-.024 1.008 1.101 1.43 1.758.68l3.82-4.219l4.476 11.086c.235.492.703.703 1.149.54l2.508-1.032c.445-.164.632-.703.398-1.195M4.61 26.148c-1.102 0-2.04.938-2.04 2.04c0 1.101.938 2.039 2.04 2.039h6.867c1.101 0 2.039-.938 2.039-2.04c0-1.101-.938-2.039-2.04-2.039Zm46.78 4.079c1.102 0 2.04-.938 2.04-2.04c0-1.101-.938-2.039-2.04-2.039h-6.843c-1.102 0-2.04.938-2.04 2.04c0 1.101.938 2.039 2.04 2.039ZM10.07 43.21c-.796.773-.796 2.11-.023 2.883s2.11.797 2.906.023l4.828-4.828c.774-.773.774-2.086 0-2.883c-.75-.773-2.086-.773-2.882 0Z\"/>",
  hand_draw: "<path fill=\"currentColor\" d=\"M2.195 36.895c.82-.024 1.407-.657 1.43-1.5c.258-10.196 5.508-17.743 13.477-20.696l5.46 15c.047.117.024.211-.093.258c-.094.047-.164 0-.235-.07l-2.765-3c-1.805-1.946-4.102-2.086-5.883-.586c-2.016 1.71-2.04 4.265-.07 6.68l7.851 9.492c5.93 7.172 12.89 9.398 20.672 6.562c9.305-3.375 13.266-11.906 9.515-22.219l-1.757-4.804c-1.828-5.086-5.32-7.172-9.422-5.742c-1.102-1.43-2.79-1.922-4.617-1.266a7.1 7.1 0 0 0-1.828 1.031c-1.196-1.547-3.047-2.11-4.97-1.43a6.5 6.5 0 0 0-1.476.797L24.812 8.09c-1.007-2.79-3.539-3.961-6.14-3.024c-2.625.961-3.797 3.47-2.79 6.258l.188.516C7 15.238.695 23.98.695 35.348c0 .843.703 1.57 1.5 1.547m38.836 9.07c-6.14 2.25-11.906 1.101-17.32-5.438l-7.852-9.445c-.843-.984-.843-1.945-.093-2.602c.703-.632 1.664-.421 2.437.375l5.414 5.602c.914.938 1.711 1.031 2.485.75c.914-.328 1.312-1.312.937-2.32l-8.297-22.828c-.351-.938.07-1.828.961-2.157c.914-.328 1.758.118 2.11 1.055l5.93 16.29c.28.773 1.148 1.124 1.921.843c.75-.281 1.148-1.102.867-1.852l-2.133-5.882c.329-.305.774-.61 1.22-.774c1.1-.398 2.015.094 2.437 1.242l1.875 5.133c.28.797 1.148 1.102 1.898.82c.727-.258 1.195-1.03.89-1.851l-1.523-4.149a3.55 3.55 0 0 1 1.219-.797c1.102-.398 2.016.094 2.438 1.243l1.242 3.422c.304.82 1.172 1.125 1.922.843a1.446 1.446 0 0 0 .89-1.851l-.937-2.532c1.968-.703 3.82.891 5.085 4.407l1.477 4.008c3.211 8.859.281 15.609-7.5 18.445\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" className="pointer-events-none" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type FileKind = "pdf" | "sheet" | "image" | "video" | "folder";
export type FileItem = { id: string; name: string; kind: FileKind; tags?: string[]; favourite?: boolean; pinned?: boolean; count?: number };
export type MenuAction = "rename" | "duplicate" | "link" | "move" | "pin" | "favourite" | "tag" | "trash";

const KIND: Record<FileKind, { icon: IconName; tint: string }> = {
  pdf: { icon: "doc_text_fill", tint: "#ff3b30" },
  sheet: { icon: "doc_chart_fill", tint: "#30b350" },
  image: { icon: "photo_fill", tint: "#0a84ff" },
  video: { icon: "film_fill", tint: "#bf5af2" },
  folder: { icon: "folder_fill", tint: "#3ea6ff" },
};

const TAGS = [
  { name: "Red", hex: "#ff3b30" },
  { name: "Orange", hex: "#ff9f0a" },
  { name: "Yellow", hex: "#ffcc00" },
  { name: "Green", hex: "#30d158" },
  { name: "Blue", hex: "#0a84ff" },
  { name: "Purple", hex: "#bf5af2" },
];

const DEMO: FileItem[] = [
  { id: "f1", name: "Brand Guide.pdf", kind: "pdf", tags: ["Red"] },
  { id: "f2", name: "Assets", kind: "folder", count: 12 },
  { id: "f3", name: "Budget.numbers", kind: "sheet", tags: ["Green"] },
  { id: "f4", name: "Hero Shot.jpg", kind: "image", favourite: true },
  { id: "f5", name: "Teaser.mov", kind: "video", tags: ["Purple", "Blue"] },
  { id: "f6", name: "Archive", kind: "folder", count: 48 },
];

const SPRING = { type: "spring", stiffness: 520, damping: 32 } as const;
const FLOW = { type: "spring", stiffness: 380, damping: 34 } as const;
const OPEN = { type: "spring", stiffness: 560, damping: 29, mass: 0.85 } as const;
const CLOSE = { type: "spring", stiffness: 760, damping: 46 } as const;
const GLIDE = { type: "spring", stiffness: 700, damping: 44 } as const;

// menu geometry
const W = 236;
const SW = 184;
const ROW = 30;
const SEP = 9;
const TAGROW = 32;
const PAD = 6;
const GAP = 12;

type Row = { key: string; label: string; icon: IconName; hint?: string; danger?: boolean; sub?: boolean } | "sep" | "tags";

function rowsFor(f: FileItem): Row[] {
  return [
    { key: "rename", label: "Rename", icon: "pencil", hint: "↩" },
    { key: "duplicate", label: "Duplicate", icon: "doc_on_doc", hint: "⌘D" },
    { key: "link", label: "Copy Link", icon: "link" },
    "sep",
    { key: "move", label: "Move To", icon: "folder", sub: true },
    { key: "pin", label: f.pinned ? "Unpin" : "Pin to Top", icon: f.pinned ? "pin_fill" : "pin" },
    { key: "favourite", label: f.favourite ? "Remove from Favourites" : "Add to Favourites", icon: f.favourite ? "star_fill" : "star" },
    "sep",
    "tags",
    "sep",
    { key: "trash", label: "Move to Trash", icon: "trash", hint: "⌘⌫", danger: true },
  ];
}
const ORDER = ["rename", "duplicate", "link", "move", "pin", "favourite", "tags", "trash"];
const rowH = (r: Row) => (r === "sep" ? SEP : r === "tags" ? TAGROW : ROW);
const MENU_H = PAD * 2 + rowsFor(DEMO[0]).reduce((a, r) => a + rowH(r), 0);
const MOVE_TOP = PAD + rowsFor(DEMO[0]).slice(0, 4).reduce((a, r) => a + rowH(r), 0);

const copyName = (name: string, taken: Set<string>) => {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let n = `${base} copy${ext}`;
  for (let i = 2; taken.has(n); i++) n = `${base} copy ${i}${ext}`;
  return n;
};

/** one file in the grid: tinted icon, name, tags, and the little badges */
const Tile = forwardRef<
  HTMLDivElement,
  {
    file: FileItem;
    selected: boolean;
    pressing: boolean;
    renaming: boolean;
    pulse: number;
    tabbable: boolean;
    onRename: (name: string | null) => void;
    handlers: {
      onPointerDown: (e: RPointerEvent<HTMLDivElement>) => void;
      onPointerMove: (e: RPointerEvent<HTMLDivElement>) => void;
      onPointerUp: () => void;
      onContextMenu: (e: RMouseEvent<HTMLDivElement>) => void;
      onFocus: () => void;
    };
  }
>(function Tile({
  file,
  selected,
  pressing,
  renaming,
  pulse,
  tabbable,
  onRename,
  handlers,
}, ref) {
  const k = KIND[file.kind];
  const icon = useAnimationControls();
  useEffect(() => {
    if (pulse) void icon.start({ scale: [1, 1.2, 0.94, 1], transition: { duration: 0.5, times: [0, 0.3, 0.65, 1] } });
  }, [pulse, icon]);
  const tags = TAGS.filter((t) => file.tags?.includes(t.name));
  return (
    <motion.div
      ref={ref}
      layout
      data-file={file.id}
      role="option"
      aria-selected={selected}
      aria-label={`${file.name}${file.kind === "folder" ? `, folder, ${file.count ?? 0} items` : ""}`}
      tabIndex={tabbable ? 0 : -1}
      {...handlers}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: pressing ? 0.92 : 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.18 } }}
      transition={{ layout: FLOW, default: pressing ? { type: "spring", stiffness: 120, damping: 20 } : SPRING }}
      className="group relative flex w-[100px] cursor-default touch-manipulation select-none flex-col items-center rounded-[14px] px-1 pb-1.5 pt-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      style={{ WebkitTouchCallout: "none" }}
    >
      <motion.div
        data-icon
        animate={icon}
        className="relative flex h-[60px] w-[60px] items-center justify-center rounded-[16px] transition-shadow duration-150"
        style={{
          background: `color-mix(in srgb, ${k.tint} 13%, white)`,
          color: k.tint,
          boxShadow: selected ? "0 0 0 4px #e8e8ed" : "0 0 0 0 transparent",
        }}
      >
        <Icon name={k.icon} size={30} />
        <AnimatePresence>
          {file.favourite && (
            <motion.span
              key="fav"
              initial={{ scale: 0, rotate: -50 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 40 }}
              transition={{ type: "spring", stiffness: 600, damping: 15 }}
              className="absolute -right-1.5 -top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[#ff9f0a] shadow-[0_1px_4px_rgba(0,0,0,.18)]"
            >
              <Icon name="star_fill" size={13} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-2 flex max-w-full items-center justify-center gap-1">
        <AnimatePresence initial={false}>
          {file.pinned && (
            <motion.span key="pin" initial={{ width: 0, opacity: 0 }} animate={{ width: 11, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex shrink-0 justify-center text-[#86868b]">
              <Icon name="pin_fill" size={11} />
            </motion.span>
          )}
        </AnimatePresence>
        {renaming ? (
          <input
            aria-label="New name"
            defaultValue={file.name}
            autoFocus
            onFocus={(e) => {
              const dot = file.name.lastIndexOf(".");
              e.currentTarget.setSelectionRange(0, dot > 0 ? dot : file.name.length);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") onRename(e.currentTarget.value);
              if (e.key === "Escape") onRename(null);
            }}
            onBlur={(e) => onRename(e.currentTarget.value)}
            className="w-[96px] rounded-[5px] border-0 bg-white px-1 py-[1px] text-center text-[12.5px] text-[#1d1d1f] outline-none ring-2 ring-[#0071e3]"
          />
        ) : (
          <span
            className="line-clamp-2 break-words rounded-[5px] px-1.5 py-[1px] text-center text-[12.5px] leading-[1.25] transition-colors duration-150"
            style={{ background: selected ? "#0071e3" : "transparent", color: selected ? "#fff" : "#1d1d1f" }}
          >
            {/* a single long word wraps before its extension rather than mid-word */}
            {file.name.lastIndexOf(".") > 0 && !file.name.includes(" ") ? (
              <>
                {file.name.slice(0, file.name.lastIndexOf("."))}
                <wbr />
                {file.name.slice(file.name.lastIndexOf("."))}
              </>
            ) : (
              file.name
            )}
          </span>
        )}
      </div>
      <div className="mt-1 flex h-[8px] items-center justify-center">
        <AnimatePresence initial={false}>
          {tags.map((t, i) => (
            <motion.span
              layout
              key={t.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 700, damping: 22 }}
              className="block h-[8px] w-[8px] rounded-full ring-[1.5px] ring-white"
              style={{ background: t.hex, marginLeft: i ? -2 : 0 }}
            />
          ))}
        </AnimatePresence>
        {file.kind === "folder" && !tags.length && <span className="text-[11px] leading-none text-[#86868b]">{file.count ?? 0} items</span>}
      </div>
    </motion.div>
  );
});

type MenuState = { n: number; id: string; px: number; py: number; via: "pointer" | "keyboard" | "auto"; at: number };
type Toast = { n: number; text: string; undo?: () => void };
type Ghost = { file: FileItem; folder: string; from: { x: number; y: number }; to?: { x: number; y: number } };

/**
 * Context Menu: the right-click menu, made out of liquid. Right-click a file
 * (or press and hold on a phone, or Shift+F10) and a drop forms under your
 * pointer, then flows out into the menu while the drop is absorbed. The
 * highlight glides from row to row; "Move To" buds a submenu off the side
 * that snaps free like a droplet. Every action is real: rename in place,
 * duplicate, copy a link, pin to the top, favourite, tag, move into a folder
 * (the file flies in and the folder bounces) or move to Trash with Undo.
 * On close, the menu drains back into the point it came from. Arrow keys,
 * Enter, Escape and the usual Finder shortcuts work throughout.
 */
export function ContextMenu({
  files: initial = DEMO,
  title = "Q4 Launch",
  autoplay = false,
  onAction,
  onChange,
  className = "",
}: {
  files?: FileItem[];
  title?: string;
  /** play a few right-clicks by itself until the first interaction */
  autoplay?: boolean;
  /** fires for every action, after the grid has updated */
  onAction?: (action: MenuAction, file: FileItem, detail?: string) => void;
  onChange?: (files: FileItem[]) => void;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.35 });
  const touched = useRef(false);

  const [files, setFilesState] = useState<FileItem[]>(initial);
  const filesRef = useRef(files);
  const setFiles = useCallback(
    (next: FileItem[] | ((f: FileItem[]) => FileItem[])) => {
      const v = typeof next === "function" ? next(filesRef.current) : next;
      filesRef.current = v;
      setFilesState(v);
      onChange?.(v);
    },
    [onChange],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef(menu);
  const [active, setActive] = useState<string | null>(null);
  const [tagIdx, setTagIdx] = useState(0);
  const [sub, setSub] = useState(false);
  const [subActive, setSubActive] = useState<string | null>(null);
  const [renaming, setRenamingState] = useState<string | null>(null);
  const renamingRef = useRef<string | null>(null);
  const setRenaming = (id: string | null) => {
    renamingRef.current = id;
    setRenamingState(id);
  };
  const [pressing, setPressing] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastRef = useRef(toast);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [pulse, setPulse] = useState<{ id: string; n: number }>({ id: "", n: 0 });
  const [size, setSize] = useState({ w: 560, h: 330 });
  const [touchUI, setTouchUI] = useState(false);
  const kb = useRef(false);
  const subTimer = useRef(0);
  const counter = useRef(0);

  // handlers and timers read these; keep them current as soon as the layout commits
  useLayoutEffect(() => {
    filesRef.current = files;
    menuRef.current = menu;
    toastRef.current = toast;
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the pointer type is only known in the browser, after mount
    setTouchUI(window.matchMedia?.("(hover: none)").matches ?? false);
  }, []);
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const file = menu ? files.find((f) => f.id === menu.id) ?? null : null;
  const folders = useMemo(() => files.filter((f) => f.kind === "folder" && f.id !== menu?.id), [files, menu?.id]);

  /* ------------------------------------------------------------ geometry */
  const geo = useMemo(() => {
    if (!menu) return null;
    const { w, h } = size;
    let mx = menu.px + 4;
    if (mx + W > w - 8) mx = menu.px - 4 - W;
    mx = Math.max(8, Math.min(mx, w - W - 8));
    let my = menu.py + 4;
    if (my + MENU_H > h - 8) my = menu.py - 4 - MENU_H;
    my = Math.max(8, Math.min(my, h - MENU_H - 8));
    const subH = PAD * 2 + Math.max(1, folders.length) * ROW;
    let side: "right" | "left" | "over" = "right";
    let sx = mx + W + GAP;
    if (sx + SW > w - 8) {
      side = "left";
      sx = mx - GAP - SW;
      if (sx < 8) {
        side = "over";
        sx = Math.min(mx + 28, w - SW - 8);
      }
    }
    let sy = side === "over" ? my + MOVE_TOP + ROW - 4 : my + MOVE_TOP - PAD;
    sy = Math.max(8, Math.min(sy, h - subH - 8));
    const anchor = my + MOVE_TOP + ROW / 2 - sy;
    return { mx, my, ox: menu.px - mx, oy: menu.py - my, sx, sy, subH, side, anchor };
  }, [menu, size, folders.length]);

  /* ------------------------------------------------------------- actions */
  const show = (text: string, undo?: () => void) => setToast({ n: ++counter.current, text, undo });
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast((c) => (c?.n === toast.n ? null : c)), 3400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const focusTile = (id: string) => window.setTimeout(() => body.current?.querySelector<HTMLElement>(`[data-file="${id}"]`)?.focus({ preventScroll: true }), 0);

  const close = useCallback((refocus = true) => {
    const m = menuRef.current;
    window.clearTimeout(subTimer.current);
    setMenu(null);
    setSub(false);
    setActive(null);
    setSubActive(null);
    if (m && refocus && m.via !== "auto") focusTile(m.id);
  }, []);

  const openAt = useCallback((id: string, px: number, py: number, via: MenuState["via"]) => {
    window.clearTimeout(subTimer.current);
    setSelected(id);
    setRenaming(null);
    setSub(false);
    setSubActive(null);
    setTagIdx(0);
    setActive(via === "keyboard" ? "rename" : null);
    kb.current = via === "keyboard";
    setMenu({ n: ++counter.current, id, px, py, via, at: performance.now() });
  }, []);

  const tileCenter = (id: string, dx = 0, dy = 0) => {
    const b = body.current?.getBoundingClientRect();
    const t = body.current?.querySelector<HTMLElement>(`[data-file="${id}"] [data-icon]`)?.getBoundingClientRect();
    if (!b || !t) return { x: 60, y: 60 };
    return { x: t.left - b.left + t.width / 2 + dx, y: t.top - b.top + t.height / 2 + dy };
  };

  const act = useCallback(
    (key: string, f: FileItem, detail?: string) => {
      const list = filesRef.current;
      const idx = list.findIndex((x) => x.id === f.id);
      switch (key) {
        case "rename":
          close(false);
          setRenaming(f.id);
          return;
        case "duplicate": {
          const copy: FileItem = { ...f, id: `${f.id}-${++counter.current}`, name: copyName(f.name, new Set(list.map((x) => x.name))), pinned: false };
          setFiles([...list.slice(0, idx + 1), copy, ...list.slice(idx + 1)]);
          setSelected(copy.id);
          close(false);
          if (menuRef.current?.via !== "auto") focusTile(copy.id);
          onAction?.("duplicate", f, copy.id);
          return;
        }
        case "link": {
          const url = `https://files.example.com/${encodeURIComponent(f.name.toLowerCase().replace(/\s+/g, "-"))}`;
          if (menuRef.current?.via !== "auto") navigator.clipboard?.writeText(url).catch(() => {});
          show("Link copied");
          close();
          onAction?.("link", f, url);
          return;
        }
        case "pin": {
          const next = { ...f, pinned: !f.pinned };
          const rest = list.filter((x) => x.id !== f.id);
          setFiles(next.pinned ? [next, ...rest] : list.map((x) => (x.id === f.id ? next : x)));
          close();
          onAction?.("pin", next);
          return;
        }
        case "favourite": {
          const next = { ...f, favourite: !f.favourite };
          setFiles(list.map((x) => (x.id === f.id ? next : x)));
          close();
          onAction?.("favourite", next);
          return;
        }
        case "tag": {
          const has = f.tags?.includes(detail!);
          const next = { ...f, tags: has ? f.tags!.filter((t) => t !== detail) : [...(f.tags ?? []), detail!] };
          setFiles(list.map((x) => (x.id === f.id ? next : x)));
          onAction?.("tag", next, detail);
          return;
        }
        case "trash": {
          setFiles(list.filter((x) => x.id !== f.id));
          setSelected(null);
          close(false);
          show(`Moved “${f.name}” to Trash`, () => {
            const cur = filesRef.current;
            setFiles([...cur.slice(0, idx), f, ...cur.slice(idx)]);
            setSelected(f.id);
          });
          onAction?.("trash", f);
          return;
        }
        case "move": {
          const folder = list.find((x) => x.id === detail);
          if (!folder || !body.current) return;
          const b = body.current.getBoundingClientRect();
          const s = body.current.querySelector<HTMLElement>(`[data-file="${f.id}"] [data-icon]`)?.getBoundingClientRect();
          setGhost({ file: f, folder: folder.id, from: s ? { x: s.left - b.left, y: s.top - b.top } : { x: 0, y: 0 } });
          setFiles(list.filter((x) => x.id !== f.id));
          setSelected(null);
          close(false);
          show(`Moved to ${folder.name}`, () => {
            const cur = filesRef.current;
            setFiles([...cur.slice(0, idx), f, ...cur.slice(idx)].map((x) => (x.id === folder.id ? { ...x, count: Math.max(0, (x.count ?? 1) - 1) } : x)));
            setSelected(f.id);
          });
          onAction?.("move", f, folder.id);
          return;
        }
      }
    },
    [close, setFiles, onAction],
  );

  // the flying file aims at where the folder will be once the grid has reflowed
  useLayoutEffect(() => {
    if (!ghost || ghost.to || !body.current) return;
    const tile = body.current.querySelector<HTMLElement>(`[data-file="${ghost.folder}"]`);
    const icon = tile?.querySelector<HTMLElement>("[data-icon]");
    if (!tile || !icon) return setGhost(null);
    setGhost({ ...ghost, to: { x: tile.offsetLeft + icon.offsetLeft, y: tile.offsetTop + icon.offsetTop } });
  }, [ghost]);
  const land = () => {
    if (!ghost) return;
    setFiles((list) => list.map((x) => (x.id === ghost.folder ? { ...x, count: (x.count ?? 0) + 1 } : x)));
    setPulse((p) => ({ id: ghost.folder, n: p.n + 1 }));
    setGhost(null);
  };

  const pick = (key: string) => {
    if (!file) return;
    if (key === "move") {
      setSub(true);
      setActive("move");
      if (kb.current) setSubActive(folders[0]?.id ?? null);
      return;
    }
    act(key, file);
  };

  /* ------------------------------------------------------- pointer + keys */
  const press = useRef<{ id: string; x: number; y: number; t: number; fired: boolean } | null>(null);
  const local = (clientX: number, clientY: number) => {
    const b = body.current!.getBoundingClientRect();
    return { x: clientX - b.left, y: clientY - b.top };
  };
  const tileHandlers = (f: FileItem) => ({
    onPointerDown: (e: RPointerEvent<HTMLDivElement>) => {
      touched.current = true;
      if (e.button === 2) return;
      setSelected(f.id);
      if (e.pointerType !== "mouse") {
        const p = local(e.clientX, e.clientY);
        setPressing(f.id);
        const t = window.setTimeout(() => {
          if (press.current) press.current.fired = true;
          setPressing(null);
          openAt(f.id, p.x, p.y, "pointer");
        }, 450);
        press.current = { id: f.id, x: e.clientX, y: e.clientY, t, fired: false };
      }
    },
    onPointerMove: (e: RPointerEvent<HTMLDivElement>) => {
      const p = press.current;
      if (p && !p.fired && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) {
        window.clearTimeout(p.t);
        press.current = null;
        setPressing(null);
      }
    },
    onPointerUp: () => {
      const p = press.current;
      if (p) window.clearTimeout(p.t);
      press.current = null;
      setPressing(null);
    },
    onContextMenu: (e: RMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      touched.current = true;
      const m = menuRef.current;
      if (m && m.id === f.id && performance.now() - m.at < 700) return; // the long press already opened it
      const p = local(e.clientX, e.clientY);
      openAt(f.id, p.x, p.y, "pointer");
    },
    onFocus: () => setSelected(f.id),
  });

  const gridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (renaming || menu) return;
    const list = filesRef.current;
    const i = list.findIndex((f) => f.id === selected);
    const f = list[i];
    const mod = e.metaKey || e.ctrlKey;
    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      if (!f) return;
      e.preventDefault();
      const c = tileCenter(f.id, 6, 6);
      openAt(f.id, c.x, c.y, "keyboard");
      return;
    }
    if (f && e.key === "Enter") {
      e.preventDefault();
      setRenaming(f.id);
      return;
    }
    if (f && mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      act("duplicate", f);
      return;
    }
    if (f && mod && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      act("trash", f);
      return;
    }
    const tiles = Array.from(body.current?.querySelectorAll<HTMLElement>("[data-file]") ?? []);
    const cols = Math.max(1, tiles.filter((t) => t.offsetTop === tiles[0]?.offsetTop).length);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? cols : e.key === "ArrowUp" ? -cols : 0;
    if (!step) return;
    e.preventDefault();
    const next = list[Math.max(0, Math.min(list.length - 1, (i < 0 ? 0 : i + step)))];
    if (next) {
      setSelected(next.id);
      focusTile(next.id);
    }
  };

  const menuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!file) return;
    touched.current = true;
    kb.current = true;
    const k = e.key;
    if (k === "Tab") {
      e.preventDefault();
      close();
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (sub) {
        setSub(false);
        setSubActive(null);
        setActive("move");
      } else close();
      return;
    }
    if (sub && subActive) {
      const ids = folders.map((f) => f.id);
      const j = ids.indexOf(subActive);
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        setSubActive(ids[(j + (k === "ArrowDown" ? 1 : -1) + ids.length) % ids.length]);
      } else if (k === "ArrowLeft") {
        e.preventDefault();
        setSub(false);
        setSubActive(null);
      } else if (k === "Enter" || k === " ") {
        e.preventDefault();
        act("move", file, subActive);
      }
      return;
    }
    const i = active ? ORDER.indexOf(active) : -1;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      const d = k === "ArrowDown" ? 1 : -1;
      setActive(ORDER[(i + d + ORDER.length) % ORDER.length] ?? ORDER[0]);
      setSub(false);
    } else if (k === "ArrowRight") {
      e.preventDefault();
      if (active === "move") pick("move");
      if (active === "tags") setTagIdx((t) => Math.min(TAGS.length - 1, t + 1));
    } else if (k === "ArrowLeft") {
      e.preventDefault();
      if (active === "tags") setTagIdx((t) => Math.max(0, t - 1));
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (active === "tags") act("tag", file, TAGS[tagIdx].name);
      else if (active) pick(active);
    }
  };

  // keep keyboard focus on the highlighted row
  useEffect(() => {
    if (!menu || menu.via === "auto" || !kb.current) return;
    const sel = sub && subActive ? `[data-sub="${subActive}"]` : active === "tags" ? `[data-tag="${tagIdx}"]` : active ? `[data-key="${active}"]` : null;
    const el = sel ? layer.current?.querySelector<HTMLElement>(sel) : layer.current?.querySelector<HTMLElement>("[role=menu]");
    el?.focus({ preventScroll: true });
  }, [menu, active, sub, subActive, tagIdx]);
  useEffect(() => {
    if (!menu || menu.via === "auto") return;
    const t = window.setTimeout(() => {
      if (!kb.current) layer.current?.querySelector<HTMLElement>("[role=menu]")?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(t);
  }, [menu]);

  // click anywhere else, scroll or resize: the menu drains away
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (layer.current?.contains(e.target as Node)) return;
      close(false);
    };
    const away = () => close(false);
    document.addEventListener("pointerdown", down, true);
    window.addEventListener("resize", away);
    window.addEventListener("scroll", away, true);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      window.removeEventListener("resize", away);
      window.removeEventListener("scroll", away, true);
    };
  }, [menu, close]);

  const hover = (key: string) => {
    kb.current = false;
    setActive(key);
    window.clearTimeout(subTimer.current);
    if (key === "move") subTimer.current = window.setTimeout(() => setSub(true), 140);
    else if (sub)
      subTimer.current = window.setTimeout(() => {
        setSub(false);
        setSubActive(null);
      }, 220);
  };

  /* ------------------------------------------------------------ autoplay */
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    const glide = async (keys: string[], gap = 230) => {
      for (const k of keys) {
        if (!ok()) return;
        setActive(k);
        await wait(gap);
      }
    };
    const fileOf = (id: string) => filesRef.current.find((f) => f.id === id);
    (async () => {
      await wait(900);
      while (ok()) {
        // favourite
        let c = tileCenter("f1", 10, 12);
        openAt("f1", c.x, c.y, "auto");
        await wait(650);
        await glide(["rename", "duplicate", "link", "move"]);
        if (!ok()) return;
        setSub(true);
        await wait(520);
        setSubActive("f2");
        await wait(380);
        setSubActive(null);
        setSub(false);
        await glide(["pin", "favourite"], 300);
        if (!ok()) return;
        const f1 = fileOf("f1");
        if (f1) act("favourite", f1);
        await wait(1500);
        if (!ok()) return;

        // move into a folder
        c = tileCenter("f5", 12, 10);
        openAt("f5", c.x, c.y, "auto");
        await wait(600);
        await glide(["duplicate", "link", "move"], 210);
        if (!ok()) return;
        setSub(true);
        await wait(500);
        setSubActive("f6");
        await wait(320);
        setSubActive("f2");
        await wait(420);
        if (!ok()) return;
        const f5 = fileOf("f5");
        if (f5) act("move", f5, "f2");
        await wait(2000);
        if (!ok()) return;

        // trash, then undo
        c = tileCenter("f3", 8, 14);
        openAt("f3", c.x, c.y, "auto");
        await wait(600);
        await glide(["duplicate", "link", "move", "pin", "favourite", "tags"], 170);
        if (!ok()) return;
        for (const t of [1, 2, 3]) {
          setTagIdx(t);
          await wait(140);
        }
        await glide(["trash"], 420);
        if (!ok()) return;
        const f3 = fileOf("f3");
        if (f3) act("trash", f3);
        await wait(1500);
        if (!ok()) return;
        toastRef.current?.undo?.();
        setToast(null);
        await wait(1700);
        if (!ok()) return;
        setSelected(null);
        setFiles(initial);
        await wait(1400);
      }
    })();
    return () => {
      alive = false;
    };
    // a fixed script
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  /* --------------------------------------------------------------- render */
  const rows = file ? rowsFor(file) : [];
  const tabStop = selected && files.some((f) => f.id === selected) ? selected : files[0]?.id;
  const subSide = geo?.side ?? "right";
  const budX = subSide === "right" ? -22 : subSide === "left" ? 22 : 0;

  const panel = (kind: "menu" | "sub", content: boolean) => {
    if (!geo) return null;
    const isMenu = kind === "menu";
    return {
      className: `absolute ${content ? "" : "bg-white"} rounded-[13px]`,
      style: isMenu
        ? { left: geo.mx, top: geo.my, width: W, height: MENU_H, transformOrigin: `${geo.ox}px ${geo.oy}px` }
        : {
            left: geo.sx,
            top: geo.sy,
            width: SW,
            height: geo.subH,
            transformOrigin: subSide === "right" ? `0px ${geo.anchor}px` : subSide === "left" ? `${SW}px ${geo.anchor}px` : `40px 0px`,
          },
      initial: isMenu ? { scale: 0.1 } : { scale: 0.3, x: budX, opacity: 1 },
      animate: isMenu ? { scale: 1, transition: OPEN } : { scale: 1, x: 0, opacity: 1, transition: OPEN },
      exit: isMenu ? { scale: 0.06, transition: CLOSE } : { scale: 0.3, x: budX, opacity: 0, transition: CLOSE },
    };
  };
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { delay: 0.05, duration: 0.16 } },
    exit: { opacity: 0, transition: { duration: 0.07 } },
  };

  return (
    <div ref={root} className={`w-full max-w-[600px] overflow-hidden rounded-[26px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`} onPointerDown={() => (touched.current = true)}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id={`${uid}-goo`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex items-center justify-between gap-3 border-b border-black/[.06] px-5 py-3.5">
        <div className="flex shrink-0 items-baseline gap-2">
          <h3 className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{title}</h3>
          <span className="shrink-0 text-[13px] tabular-nums text-[#86868b]">{files.length} items</span>
        </div>
        <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] text-[#6e6e73]">
          <span className="flex shrink-0">
            <Icon name={touchUI ? "hand_draw" : "cursor_rays"} size={13} />
          </span>
          <span className="truncate">{touchUI ? "Press and hold a file" : "Right-click a file"}</span>
        </span>
      </div>

      <div
        ref={body}
        className="relative min-h-[340px] p-3.5"
        onPointerDown={(e) => {
          if (!(e.target as HTMLElement).closest("[data-file], [role=menu], [role=status]")) setSelected(null);
        }}
      >
        <div role="listbox" aria-label={`${title} files. Press Shift+F10 or the Menu key for actions.`} aria-orientation="horizontal" onKeyDown={gridKey} className="flex flex-wrap content-start gap-x-1 gap-y-2">
          <AnimatePresence mode="popLayout">
            {files.map((f) => (
              <Tile
                key={f.id}
                file={f}
                selected={selected === f.id}
                pressing={pressing === f.id}
                renaming={renaming === f.id}
                pulse={pulse.id === f.id ? pulse.n : 0}
                tabbable={tabStop === f.id}
                handlers={tileHandlers(f)}
                onRename={(name) => {
                  if (renamingRef.current !== f.id) return; // Enter or Escape already settled it
                  setRenaming(null);
                  const v = name?.trim();
                  if (v && v !== f.name) {
                    setFiles(filesRef.current.map((x) => (x.id === f.id ? { ...x, name: v } : x)));
                    onAction?.("rename", { ...f, name: v }, f.name);
                  }
                  focusTile(f.id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* the file on its way into a folder */}
        {ghost?.to && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-30 flex h-[60px] w-[60px] items-center justify-center rounded-[16px] shadow-[0_10px_24px_-10px_rgba(0,0,0,.4)]"
            style={{ background: `color-mix(in srgb, ${KIND[ghost.file.kind].tint} 13%, white)`, color: KIND[ghost.file.kind].tint }}
            initial={{ x: ghost.from.x, y: ghost.from.y, scale: 1, opacity: 1 }}
            animate={{
              x: [ghost.from.x, (ghost.from.x + ghost.to.x) / 2, ghost.to.x],
              y: [ghost.from.y, Math.min(ghost.from.y, ghost.to.y) - 46, ghost.to.y],
              scale: [1, 0.86, 0.32],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.62, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }}
            onAnimationComplete={land}
          >
            <Icon name={KIND[ghost.file.kind].icon} size={30} />
          </motion.div>
        )}

        {/* liquid: the drop, the menu and the submenu share one goo filter, so they flow into each other */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{ filter: `url(#${uid}-goo) drop-shadow(0 16px 26px rgba(0,0,0,.16)) drop-shadow(0 0 0.6px rgba(0,0,0,.35))` }}>
          <AnimatePresence>
            {menu && geo && (
              <motion.div key={menu.n} className="absolute inset-0" exit={{ opacity: 1, transition: { duration: 0.4 } }}>
                <motion.div
                  className="absolute rounded-full bg-white"
                  style={{ left: menu.px - 13, top: menu.py - 13, width: 26, height: 26 }}
                  initial={{ scale: 0.2 }}
                  animate={{ scale: [0.2, 1.1, 0], transition: { duration: 0.55, times: [0, 0.22, 1], ease: ["easeOut", "easeIn"] } }}
                  exit={{ scale: [0, 1, 0], transition: { duration: 0.36, times: [0, 0.45, 1] } }}
                />
                <motion.div {...panel("menu", false)!} />
                <AnimatePresence>{sub && subSide !== "over" && <motion.div key="sub" {...panel("sub", false)!} />}</AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the readable layer on top: same shapes, same springs, no filter */}
        <div ref={layer} className="pointer-events-none absolute inset-0 z-20">
          <AnimatePresence>
            {menu && geo && file && (
              <motion.div key={menu.n} className="absolute inset-0" exit={{ opacity: 1, transition: { duration: 0.4 } }}>
                <motion.div {...panel("menu", true)!} className="pointer-events-auto absolute rounded-[13px]">
                  <motion.div
                    {...fade}
                    role="menu"
                    tabIndex={-1}
                    aria-label={`Actions for ${file.name}`}
                    onKeyDown={menuKey}
                    onPointerLeave={() => !sub && setActive(null)}
                    className="flex h-full flex-col p-[6px] outline-none"
                  >
                    {rows.map((row, i) => {
                      if (row === "sep") return <div key={`s${i}`} role="separator" className="mx-2.5 my-1 h-px shrink-0 bg-black/[.08]" />;
                      if (row === "tags")
                        return (
                          <div key="tags" role="group" aria-label="Tags" onPointerEnter={() => hover("tags")} className="flex h-[32px] shrink-0 items-center gap-[9px] px-2.5">
                            {TAGS.map((t, j) => {
                              const on = !!file.tags?.includes(t.name);
                              const focus = active === "tags" && tagIdx === j;
                              return (
                                <motion.button
                                  key={t.name}
                                  type="button"
                                  role="menuitemcheckbox"
                                  aria-checked={on}
                                  aria-label={`${t.name} tag`}
                                  data-tag={j}
                                  tabIndex={-1}
                                  onClick={() => act("tag", file, t.name)}
                                  onPointerEnter={() => setTagIdx(j)}
                                  whileHover={{ scale: 1.22 }}
                                  whileTap={{ scale: 0.9 }}
                                  animate={{ scale: focus ? 1.22 : 1 }}
                                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                                  className="relative flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full border-0 p-0 text-white outline-none"
                                  style={{ background: t.hex, boxShadow: on ? `0 0 0 2px #fff, 0 0 0 3.5px ${t.hex}` : "none" }}
                                >
                                  <AnimatePresence>
                                    {on && (
                                      <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex">
                                        <Icon name="checkmark" size={10} />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              );
                            })}
                          </div>
                        );
                      const on = active === row.key;
                      return (
                        <button
                          key={row.key}
                          type="button"
                          role="menuitem"
                          data-key={row.key}
                          tabIndex={-1}
                          aria-haspopup={row.sub ? "menu" : undefined}
                          aria-expanded={row.sub ? sub : undefined}
                          onPointerEnter={() => hover(row.key)}
                          onClick={() => pick(row.key)}
                          className="relative flex h-[30px] w-full shrink-0 cursor-default items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-[13.5px] outline-none transition-colors duration-100"
                          style={{ color: on ? "#fff" : row.danger ? "#ff3b30" : "#1d1d1f" }}
                        >
                          {on && <motion.span layoutId={`${uid}-hl`} className="absolute inset-0 z-0 rounded-[7px]" style={{ background: row.danger ? "#ff3b30" : "#0071e3" }} transition={GLIDE} />}
                          <span className="relative z-[1] flex opacity-90">
                            <Icon name={row.icon} size={15} />
                          </span>
                          <span className="relative z-[1] min-w-0 flex-1 truncate">{row.label}</span>
                          {row.hint && (
                            <span className="relative z-[1] text-[12px]" style={{ color: on ? "rgba(255,255,255,.78)" : "#86868b" }}>
                              {row.hint}
                            </span>
                          )}
                          {row.sub && (
                            <span className="relative z-[1] flex" style={{ color: on ? "#fff" : "#86868b" }}>
                              <Icon name="chevron_right" size={11} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {sub && (
                    <motion.div
                      key="sub"
                      {...panel("sub", true)!}
                      className={`pointer-events-auto absolute rounded-[13px] ${subSide === "over" ? "bg-white shadow-[0_0_0_.5px_rgba(0,0,0,.2),0_16px_30px_-10px_rgba(0,0,0,.3)]" : ""}`}
                      onPointerEnter={() => {
                        window.clearTimeout(subTimer.current);
                        setActive("move");
                      }}
                    >
                      <motion.div {...fade} role="menu" aria-label="Move To" onKeyDown={menuKey} onPointerLeave={() => setSubActive(null)} className="flex flex-col p-[6px]">
                        {folders.length ? (
                          folders.map((d) => {
                            const on = subActive === d.id;
                            return (
                              <button
                                key={d.id}
                                type="button"
                                role="menuitem"
                                data-sub={d.id}
                                tabIndex={-1}
                                onPointerEnter={() => {
                                  kb.current = false;
                                  setSubActive(d.id);
                                }}
                                onClick={() => act("move", file, d.id)}
                                className="relative flex h-[30px] w-full cursor-default items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-[13.5px] outline-none transition-colors duration-100"
                                style={{ color: on ? "#fff" : "#1d1d1f" }}
                              >
                                {on && <motion.span layoutId={`${uid}-hl2`} className="absolute inset-0 z-0 rounded-[7px] bg-[#0071e3]" transition={GLIDE} />}
                                <span className="relative z-[1] flex" style={{ color: on ? "#fff" : KIND.folder.tint }}>
                                  <Icon name="folder_fill" size={15} />
                                </span>
                                <span className="relative z-[1] min-w-0 flex-1 truncate">{d.name}</span>
                                <span className="relative z-[1] text-[12px] tabular-nums" style={{ color: on ? "rgba(255,255,255,.78)" : "#86868b" }}>
                                  {d.count ?? 0}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <span className="flex h-[30px] items-center px-2.5 text-[13.5px] text-[#86868b]">No folders</span>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center px-3">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.n}
                role="status"
                initial={{ opacity: 0, y: 18, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.18 } }}
                transition={SPRING}
                className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-[#1d1d1f] py-2 pl-4 pr-2 text-[13px] text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,.6)]"
              >
                <span className="min-w-0 truncate">{toast.text}</span>
                {toast.undo ? (
                  <button
                    type="button"
                    onClick={() => {
                      touched.current = true;
                      toast.undo?.();
                      setToast(null);
                    }}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-0 bg-white/[.14] px-2.5 py-1 text-[12.5px] font-medium text-white outline-none transition-colors hover:bg-white/[.22] focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Icon name="arrow_uturn_left" size={12} />
                    Undo
                  </button>
                ) : (
                  <span className="w-1" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ContextMenu;
```

# Desktop Context Menu

Add the "Desktop Context Menu" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DesktopContextMenu } from "@/components/context-menu/desktop-context-menu";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/context-menu/desktop-context-menu.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability, react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type RefObject,
  type MouseEvent as RMouseEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type CtxFile = {
  id: string;
  name: string;
  kind: "pdf" | "folder" | "image" | "doc";
  meta: string;
  tag?: string;
  pinned?: boolean;
  sidebar?: boolean;
};
export type DesktopContextMenuProps = {
  files?: CtxFile[];
  onAction?: (action: string, file: CtxFile) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  pdf: "M44 120h168a4 4 0 0 0 4-4V88a8 8 0 0 0-2.34-5.66l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v76a4 4 0 0 0 4 4m108-76l44 44h-44Zm72 108.53a8.18 8.18 0 0 1-8.25 7.47H192v16h15.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53H192v15.73a8.17 8.17 0 0 1-7.47 8.25a8 8 0 0 1-8.53-8V152a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8.53M64 144H48a8 8 0 0 0-8 8v55.73a8.17 8.17 0 0 0 7.47 8.27a8 8 0 0 0 8.53-8v-8h7.4c15.24 0 28.14-11.92 28.59-27.15A28 28 0 0 0 64 144m-.35 40H56v-24h8a12 12 0 0 1 12 13.16A12.25 12.25 0 0 1 63.65 184M128 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h15.32c19.66 0 36.21-15.48 36.67-35.13A36 36 0 0 0 128 144m-.49 56H120v-40h8a20 20 0 0 1 20 20.77c-.42 10.82-9.66 19.23-20.49 19.23",
  folder:
    "M232 88v112.89A15.13 15.13 0 0 1 216.89 216H40a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h53.33a16.12 16.12 0 0 1 9.6 3.2L130.67 72H216a16 16 0 0 1 16 16",
  image:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 112H40v-39.31l46.34-46.35a8 8 0 0 1 11.32 0L165 181.66a8 8 0 0 0 11.32-11.32l-17.66-17.65L173 138.34a8 8 0 0 1 11.31 0L216 170.07z",
  doc: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
  open: "M228 104a12 12 0 0 1-24 0V69l-59.51 59.51a12 12 0 0 1-17-17L187 52h-35a12 12 0 0 1 0-24h64a12 12 0 0 1 12 12Zm-44 24a12 12 0 0 0-12 12v64H52V84h64a12 12 0 0 0 0-24H48a20 20 0 0 0-20 20v128a20 20 0 0 0 20 20h128a20 20 0 0 0 20-20v-68a12 12 0 0 0-12-12",
  openWith:
    "M216 36H40a20 20 0 0 0-20 20v144a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20m-4 160H44V60h168ZM60 92a16 16 0 1 1 16 16a16 16 0 0 1-16-16m48 0a16 16 0 1 1 16 16a16 16 0 0 1-16-16",
  rename:
    "m230.14 70.54l-44.68-44.69a20 20 0 0 0-28.29 0L33.86 149.17A19.85 19.85 0 0 0 28 163.31V208a20 20 0 0 0 20 20h44.69a19.86 19.86 0 0 0 14.14-5.86L230.14 98.82a20 20 0 0 0 0-28.28M91 204H52v-39l84-84l39 39Zm101-101l-39-39l18.34-18.34l39 39Z",
  dup: "M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z",
  share:
    "M220 112v96a20 20 0 0 1-20 20H56a20 20 0 0 1-20-20v-96a20 20 0 0 1 20-20h20a12 12 0 0 1 0 24H60v88h136v-88h-16a12 12 0 0 1 0-24h20a20 20 0 0 1 20 20M96.49 72.49L116 53v83a12 12 0 0 0 24 0V53l19.51 19.52a12 12 0 1 0 17-17l-40-40a12 12 0 0 0-17 0l-40 40a12 12 0 1 0 17 17Z",
  pin: "m238.15 78.54l-60.69-60.68a20 20 0 0 0-28.3 0L97.2 70c-12.43-3.33-36.68-5.72-61.74 14.5a20 20 0 0 0-1.6 29.73l45.46 45.47l-39.8 39.8a12 12 0 0 0 17 17l39.8-39.81l45.47 45.46a20 20 0 0 0 14.12 5.85c.46 0 .93 0 1.4-.05a20 20 0 0 0 14.56-7.95c4.69-6.23 11-16.13 14.44-28s3.45-22.88.16-33.4l51.7-51.87a20 20 0 0 0-.02-28.19m-74.26 68.79a12 12 0 0 0-2.23 13.84c3.43 6.86 6.9 21-6.28 40.65L54.08 100.53c21.09-14.59 39.53-6.64 41-6a11.67 11.67 0 0 0 13.81-2.29l54.43-54.61l55 55Z",
  pinFill:
    "m235.33 104l-53.47 53.65c4.56 12.67 6.45 33.89-13.19 60A15.93 15.93 0 0 1 157 224h-1.13a16 16 0 0 1-11.32-4.69L96.29 171l-42.63 42.66a8 8 0 0 1-11.32-11.32L85 159.71l-48.3-48.3A16 16 0 0 1 38 87.63c25.42-20.51 49.75-16.48 60.4-13.14L152 20.7a16 16 0 0 1 22.63 0l60.69 60.68a16 16 0 0 1 .01 22.62",
  sidebar:
    "M216 36H40a20 20 0 0 0-20 20v144a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20M44 60h32v136H44Zm168 136H100V60h112Z",
  trash:
    "M216 48h-36V36a28 28 0 0 0-28-28h-48a28 28 0 0 0-28 28v12H40a12 12 0 0 0 0 24h4v136a20 20 0 0 0 20 20h128a20 20 0 0 0 20-20V72h4a12 12 0 0 0 0-24M100 36a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v12h-56Zm88 168H68V72h120Zm-72-100v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0m48 0v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0",
  caret: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  link: "M117.18 188.74a12 12 0 0 1 0 17l-5.12 5.12A58.26 58.26 0 0 1 70.6 228a58.62 58.62 0 0 1-41.46-100.08l34.75-34.75a58.64 58.64 0 0 1 98.56 28.11a12 12 0 1 1-23.37 5.44a34.65 34.65 0 0 0-58.22-16.58l-34.75 34.75A34.62 34.62 0 0 0 70.57 204a34.4 34.4 0 0 0 24.49-10.14l5.11-5.12a12 12 0 0 1 17.01 0M226.83 45.17a58.65 58.65 0 0 0-82.93 0l-5.11 5.11a12 12 0 0 0 17 17l5.12-5.12a34.63 34.63 0 1 1 49 49l-34.81 34.7A34.4 34.4 0 0 1 150.61 156a34.63 34.63 0 0 1-33.69-26.72a12 12 0 0 0-23.38 5.44A58.64 58.64 0 0 0 150.56 180h.05a58.28 58.28 0 0 0 41.47-17.17l34.75-34.75a58.62 58.62 0 0 0 0-82.91",
  mail: "M224 44H32a12 12 0 0 0-12 12v136a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a12 12 0 0 0-12-12m-30.85 24L128 127.72L62.85 68ZM44 188V83.28l75.89 69.57a12 12 0 0 0 16.22 0L212 83.28V188Z",
  chat: "M128 20a108 108 0 0 0-96.15 157.23L21 209.66A20 20 0 0 0 46.34 235l32.43-10.81A108 108 0 1 0 128 20m0 192a84 84 0 0 1-42.06-11.27a12 12 0 0 0-6-1.62a12.1 12.1 0 0 0-3.8.62l-29.79 9.93l9.93-29.79a12 12 0 0 0-1-9.81A84 84 0 1 1 128 212",
  eye: "M251 123.13c-.37-.81-9.13-20.26-28.48-39.61C196.63 57.67 164 44 128 44S59.37 57.67 33.51 83.52C14.16 102.87 5.4 122.32 5 123.13a12.08 12.08 0 0 0 0 9.75c.37.82 9.13 20.26 28.49 39.61C59.37 198.34 92 212 128 212s68.63-13.66 94.48-39.51c19.36-19.35 28.12-38.79 28.49-39.61a12.08 12.08 0 0 0 .03-9.75m-46.06 33C183.47 177.27 157.59 188 128 188s-55.47-10.73-76.91-31.88A130.4 130.4 0 0 1 29.52 128a130.5 130.5 0 0 1 21.57-28.11C72.54 78.73 98.41 68 128 68s55.46 10.73 76.91 31.89A130.4 130.4 0 0 1 226.48 128a130.5 130.5 0 0 1-21.57 28.12ZM128 84a44 44 0 1 0 44 44a44.05 44.05 0 0 0-44-44m0 64a20 20 0 1 1 20-20a20 20 0 0 1-20 20",
  pen: "M252 92.68a19.86 19.86 0 0 0-5.86-14.14L177.46 9.85a20 20 0 0 0-28.29 0l-27.82 27.82l-57.24 21.47A20 20 0 0 0 51.4 74.58L28.16 214A12 12 0 0 0 40 228a12 12 0 0 0 2-.16l139.45-23.25a20.07 20.07 0 0 0 15.44-12.7l21.46-57.25l27.82-27.82A19.85 19.85 0 0 0 252 92.68m-76.8 88.62L75 198l33-33a34 34 0 1 0-17-17l-33 33L74.7 80.8L125 61.94L194.05 131ZM112 134a10 10 0 1 1 10 10a10 10 0 0 1-10-10m96-23l-63-63l18.34-18.34l63 63Z",
  brush:
    "M236 32a12 12 0 0 0-12-12c-44.78 0-90 48.54-115.9 82a64 64 0 0 0-80 62c0 12-3.1 22.71-9.23 31.76a43 43 0 0 1-9.47 10.29a11.88 11.88 0 0 0-4.91 13.38A12.07 12.07 0 0 0 16.11 228h76A64 64 0 0 0 154 148c33.49-25.95 82-71.2 82-116m-26.38 14.39c-4 12.92-13.15 27.49-26.92 42.91c-3 3.39-6.16 6.7-9.35 9.89a104.3 104.3 0 0 0-16.5-16.51c3.19-3.19 6.49-6.32 9.88-9.35c15.42-13.78 29.98-22.9 42.89-26.94M92.07 204H42a80.17 80.17 0 0 0 10.14-40a40 40 0 1 1 40 40Zm38.18-91.32c3.12-3.93 6.55-8.09 10.23-12.35a80.5 80.5 0 0 1 15.23 15.24a388 388 0 0 1-12.35 10.23a64.4 64.4 0 0 0-13.11-13.12",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const FILES: CtxFile[] = [
  { id: "f1", name: "Q3 report.pdf", kind: "pdf", meta: "2.4 MB" },
  {
    id: "f2",
    name: "Brand assets",
    kind: "folder",
    meta: "18 files",
    sidebar: true,
  },
  {
    id: "f3",
    name: "Launch hero.png",
    kind: "image",
    meta: "840 KB",
    tag: "#0a84ff",
  },
  { id: "f4", name: "Release notes.txt", kind: "doc", meta: "6 KB" },
];
const TAGS = ["#ff3b30", "#ff9f0a", "#30d158", "#0a84ff", "#bf5af2"];

type Item =
  | {
      kind: "item";
      id: string;
      label: string;
      icon: string;
      keys?: string;
      sub?: Item[];
      danger?: boolean;
    }
  | { kind: "check"; id: string; label: string; icon: string; on: boolean }
  | { kind: "tags" }
  | { kind: "sep" };

/**
 * A context menu that opens where you are.
 *
 * Right-click a file (or long-press it, or focus it and press Shift F10) and the menu springs out of the point you
 * clicked, from the corner nearest the cursor, flipping to stay on screen. A soft highlight slides from row to row.
 * Submenus open on a short hover and stay open while you head toward them, even across a corner of another row, so
 * you never lose them on the way. Everything works: open, rename in place, duplicate, share, pin to the top, show in
 * the sidebar, colour tags, and delete, which asks once more and then offers Undo. With a keyboard: arrows to move,
 * Right to open a submenu, Left or Escape to leave it, Enter to choose, or type a letter to jump.
 *   <DesktopContextMenu files={files} onAction={(action, file) => run(action, file)} />
 */
export default function DesktopContextMenu({
  files = FILES,
  onAction,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: DesktopContextMenuProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  // true while the demo itself is acting, so it never moves anyone's focus
  const demo = useRef(false);
  const [list, setList] = useState(files);
  const [menu, setMenu] = useState<{
    file: string;
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const [hl, setHl] = useState<string | null>(null);
  const [sub, setSub] = useState<{
    id: string;
    top: number;
    left: boolean;
  } | null>(null);
  const [subHl, setSubHl] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    text: string;
    undo?: () => void;
    key: number;
  } | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const file = menu ? (list.find((f) => f.id === menu.file) ?? null) : null;

  const items: Item[] = file
    ? [
        { kind: "item", id: "open", label: "Open", icon: I.open, keys: "⌘O" },
        {
          kind: "item",
          id: "openWith",
          label: "Open with",
          icon: I.openWith,
          sub: [
            { kind: "item", id: "with:Preview", label: "Preview", icon: I.eye },
            { kind: "item", id: "with:Figma", label: "Figma", icon: I.pen },
            {
              kind: "item",
              id: "with:Photoshop",
              label: "Photoshop",
              icon: I.brush,
            },
          ],
        },
        {
          kind: "item",
          id: "rename",
          label: "Rename",
          icon: I.rename,
          keys: "↩",
        },
        {
          kind: "item",
          id: "dup",
          label: "Duplicate",
          icon: I.dup,
          keys: "⌘D",
        },
        {
          kind: "item",
          id: "share",
          label: "Share",
          icon: I.share,
          sub: [
            {
              kind: "item",
              id: "share:link",
              label: "Copy link",
              icon: I.link,
              keys: "⌘L",
            },
            { kind: "item", id: "share:mail", label: "Email", icon: I.mail },
            { kind: "item", id: "share:msg", label: "Messages", icon: I.chat },
          ],
        },
        { kind: "sep" },
        {
          kind: "check",
          id: "pin",
          label: "Pin to top",
          icon: I.pin,
          on: !!file.pinned,
        },
        {
          kind: "check",
          id: "sidebar",
          label: "Show in sidebar",
          icon: I.sidebar,
          on: !!file.sidebar,
        },
        { kind: "tags" },
        { kind: "sep" },
        {
          kind: "item",
          id: "delete",
          label: "Delete",
          icon: I.trash,
          keys: "⌘⌫",
          danger: true,
        },
      ]
    : [];
  const rows = items.filter((i): i is Extract<Item, { id: string }> => "id" in i);
  const subItems = sub
    ? ((rows.find((r) => r.id === sub.id) as Extract<Item, { kind: "item" }>)?.sub ?? []).filter(
        (i): i is Extract<Item, { kind: "item" }> => i.kind === "item",
      )
    : [];

  const say = (text: string, undo?: () => void) => setToast({ text, undo, key: Date.now() });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.undo ? 4200 : 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // ------------------------------------------------------------ opening and closing
  const openAt = (fileId: string, clientX: number, clientY: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    if (!demo.current) touched.current = true;
    const MW = 236;
    const MH = 372;
    let x = clientX - r.left;
    let y = clientY - r.top;
    let ox = 0;
    let oy = 0;
    // flip so it stays inside the card, growing from the corner nearest the pointer
    if (x + MW > r.width - 8) {
      x = Math.max(8, x - MW);
      ox = 1;
    }
    if (y + MH > r.height - 8) {
      y = Math.max(8, y - MH);
      oy = 1;
    }
    setMenu({ file: fileId, x, y, ox, oy });
    setHl(null);
    setSub(null);
    setArmed(false);
    sfx.tick({ freq: 2200, gain: 0.05 });
    sfx.whoosh(1400, 2600, { dur: 0.12, gain: 0.02 });
    if (!demo.current) setTimeout(() => menuRef.current?.focus({ preventScroll: true }), 10);
  };
  const close = (refocus = true) => {
    const f = menu?.file;
    setMenu(null);
    setSub(null);
    setHl(null);
    setArmed(false);
    if (refocus && f && !demo.current)
      setTimeout(
        () => rootRef.current?.querySelector<HTMLElement>(`[data-file="${f}"]`)?.focus({ preventScroll: true }),
        20,
      );
  };
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !subRef.current?.contains(e.target as Node)) close(false);
    };
    window.addEventListener("pointerdown", down, true);
    return () => window.removeEventListener("pointerdown", down, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  // ------------------------------------------------------------ doing things
  const run = (id: string) => {
    if (!file) return;
    const f = file;
    const act = (name: string) => onAction?.(name, f);
    if (id === "delete") {
      if (!armed) {
        setArmed(true);
        sfx.note(330, { dur: 0.18, gain: 0.05, bell: 0.2 });
        return;
      }
      const at = list.findIndex((x) => x.id === f.id);
      setList((l) => l.filter((x) => x.id !== f.id));
      sfx.whoosh(1600, 300, { dur: 0.35, gain: 0.05 });
      say(`Deleted ${f.name}`, () => {
        setList((l) => {
          const c = l.slice();
          c.splice(at, 0, f);
          return c;
        });
        setToast(null);
      });
      act("delete");
      close(false);
      return;
    }
    if (id === "pin") {
      setList((l) => {
        const next = l.map((x) => (x.id === f.id ? { ...x, pinned: !x.pinned } : x));
        return [...next.filter((x) => x.pinned), ...next.filter((x) => !x.pinned)];
      });
      sfx.note(f.pinned ? 523 : 784, { dur: 0.2, gain: 0.05, bell: 0.4 });
      act(f.pinned ? "unpin" : "pin");
      close();
      return;
    }
    if (id === "sidebar") {
      setList((l) => l.map((x) => (x.id === f.id ? { ...x, sidebar: !x.sidebar } : x)));
      sfx.tick({ freq: f.sidebar ? 1800 : 2800, gain: 0.05 });
      act("sidebar");
      return; // a checkbox row leaves the menu open, as on the Mac
    }
    if (id.startsWith("tag:")) {
      const c = id.slice(4);
      setList((l) => l.map((x) => (x.id === f.id ? { ...x, tag: x.tag === c ? undefined : c } : x)));
      sfx.note(660 + TAGS.indexOf(c) * 80, {
        dur: 0.16,
        gain: 0.04,
        bell: 0.5,
      });
      act("tag");
      return;
    }
    if (id === "rename") {
      setRenaming(f.id);
      close(false);
      return;
    }
    if (id === "dup") {
      const dot = f.name.lastIndexOf(".");
      const name = dot > 0 ? `${f.name.slice(0, dot)} copy${f.name.slice(dot)}` : `${f.name} copy`;
      const nf = { ...f, id: `${f.id}-${Date.now()}`, name, pinned: false };
      setList((l) => {
        const i = l.findIndex((x) => x.id === f.id);
        const c = l.slice();
        c.splice(i + 1, 0, nf);
        return c;
      });
      setFresh(nf.id);
      setTimeout(() => setFresh(null), 900);
      sfx.note(880, { dur: 0.2, gain: 0.05, bell: 0.5 });
      act("duplicate");
      close();
      return;
    }
    if (id.startsWith("with:")) say(`Opening ${f.name} in ${id.slice(5)}`);
    else if (id === "open") say(`Opened ${f.name}`);
    else if (id === "share:link") say("Link copied");
    else if (id.startsWith("share:")) say(`Sharing ${f.name} by ${id === "share:mail" ? "email" : "Messages"}`);
    else return;
    sfx.note(988, { dur: 0.18, gain: 0.04, bell: 0.5 });
    act(id);
    close();
  };

  // ------------------------------------------------------------ submenus, and the corridor to them
  const subTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPt = useRef<{ x: number; y: number }[]>([]);
  const openSub = (id: string, rowEl: HTMLElement, immediate = false) => {
    if (subTimer.current) clearTimeout(subTimer.current);
    const go = () => {
      const m = menuRef.current?.getBoundingClientRect();
      const rr = rowEl.getBoundingClientRect();
      const root = rootRef.current?.getBoundingClientRect();
      if (!m || !root) return;
      const left = m.right + 200 > root.right - 6;
      setSub({ id, top: rr.top - m.top - 6, left });
      setSubHl(null);
      sfx.tick({ freq: 2600, gain: 0.03 });
    };
    if (immediate) go();
    else subTimer.current = setTimeout(go, 120);
  };
  // while the pointer heads for an open submenu it may cross other rows: if it's inside the triangle from where it
  // was to the submenu's near edge, those rows don't take over
  const headingToSub = (x: number, y: number) => {
    const s = subRef.current?.getBoundingClientRect();
    const prev = lastPt.current[0];
    if (!s || !prev || !sub) return false;
    const ex = sub.left ? s.right : s.left;
    const a = { x: prev.x, y: prev.y };
    const b = { x: ex, y: s.top - 8 };
    const c = { x: ex, y: s.bottom + 8 };
    const sign = (p1: typeof a, p2: typeof a, p3: typeof a) =>
      (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    const p = { x, y };
    const d1 = sign(p, a, b);
    const d2 = sign(p, b, c);
    const d3 = sign(p, c, a);
    const neg = d1 < 0 || d2 < 0 || d3 < 0;
    const pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  };
  const onRowEnter = (e: RPointerEvent<HTMLElement>, r: Extract<Item, { id: string }>) => {
    if (e.pointerType !== "mouse") return;
    if (sub && sub.id !== r.id && headingToSub(e.clientX, e.clientY)) {
      // check again in a moment: if the pointer stopped here, it meant this row
      if (subTimer.current) clearTimeout(subTimer.current);
      const el = e.currentTarget;
      subTimer.current = setTimeout(() => {
        setHl(r.id);
        if (r.kind === "item" && r.sub) openSub(r.id, el, true);
        else setSub(null);
      }, 260);
      return;
    }
    setHl(r.id);
    if (r.kind === "item" && r.sub) openSub(r.id, e.currentTarget);
    else {
      if (subTimer.current) clearTimeout(subTimer.current);
      if (sub) subTimer.current = setTimeout(() => setSub(null), 80);
    }
  };
  const onMenuMove = (e: RPointerEvent<HTMLDivElement>) => {
    lastPt.current = [{ x: e.clientX, y: e.clientY }, ...lastPt.current].slice(0, 4);
  };

  // ------------------------------------------------------------ keyboard
  const typeahead = useRef({ s: "", t: 0 });
  const onMenuKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const inSub = !!sub && subHl != null;
    const pool = inSub ? subItems : rows;
    const cur = inSub ? subHl : hl;
    const i = pool.findIndex((r) => r.id === cur);
    const move = (to: number) => {
      const id = pool[(to + pool.length) % pool.length].id;
      if (inSub) setSubHl(id);
      else {
        setHl(id);
        setSub(null);
      }
      sfx.tick({ freq: 2400, gain: 0.025 });
    };
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i < 0 ? pool.length - 1 : i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(pool.length - 1);
    else if (e.key === "ArrowRight" && !inSub) {
      const r = rows[i];
      if (r && r.kind === "item" && r.sub) {
        const el = menuRef.current?.querySelector<HTMLElement>(`[data-row="${r.id}"]`);
        if (el) openSub(r.id, el, true);
        setTimeout(() => setSubHl(r.sub![0] && "id" in r.sub![0] ? (r.sub![0] as { id: string }).id : null), 0);
      }
    } else if ((e.key === "ArrowLeft" || e.key === "Escape") && inSub) {
      setSub(null);
      setSubHl(null);
    } else if (e.key === "Escape") close();
    else if (e.key === "Enter" || e.key === " ") {
      if (cur) {
        const r = pool[i];
        if (r && r.kind === "item" && r.sub) {
          const el = menuRef.current?.querySelector<HTMLElement>(`[data-row="${r.id}"]`);
          if (el) openSub(r.id, el, true);
          setTimeout(() => setSubHl((r.sub![0] as { id: string }).id), 0);
        } else run(cur);
      }
    } else if (e.key === "Tab") close();
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typeahead.current = {
        s: now - typeahead.current.t < 600 ? typeahead.current.s + e.key.toLowerCase() : e.key.toLowerCase(),
        t: now,
      };
      const hit = pool.find((r) => r.label.toLowerCase().startsWith(typeahead.current.s));
      if (hit) inSub ? setSubHl(hit.id) : setHl(hit.id);
    } else return;
    e.preventDefault();
  };

  // ------------------------------------------------------------ the tiles
  const press = useRef<{
    t: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  const onTileDown = (e: RPointerEvent<HTMLElement>, id: string) => {
    if (e.pointerType === "mouse") return;
    const x = e.clientX;
    const y = e.clientY;
    press.current = { t: setTimeout(() => openAt(id, x, y), 480), x, y };
  };
  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.t);
    press.current = null;
  };
  const onTileKey = (e: RKeyboardEvent<HTMLElement>, id: string) => {
    if ((e.shiftKey && e.key === "F10") || e.key === "DesktopContextMenu") {
      e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect();
      openAt(id, r.left + r.width * 0.6, r.top + r.height * 0.55);
    } else if (e.key === "Enter" && !renaming) {
      say(`Opened ${list.find((f) => f.id === id)?.name}`);
    }
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ openAt, setHl, setSub, openSub, run, close, setList });
  ap.current = { openAt, setHl, setSub, openSub, run, close, setList };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const act = (f: () => void) => {
      demo.current = true;
      f();
      demo.current = false;
    };
    const tile = (id: string) => rootRef.current?.querySelector<HTMLElement>(`[data-file="${id}"]`);
    (async () => {
      while (alive) {
        await sleep(1300);
        if (!ok()) break;
        let el = tile("f1");
        if (!el) break;
        let r = el.getBoundingClientRect();
        act(() => ap.current.openAt("f1", r.left + r.width * 0.55, r.top + r.height * 0.5));
        for (const id of ["open", "openWith", "rename", "dup", "share"]) {
          await sleep(260);
          if (!ok()) break;
          act(() => ap.current.setHl(id));
        }
        await sleep(200);
        const row = menuRef.current?.querySelector<HTMLElement>('[data-row="share"]');
        if (row && ok()) act(() => ap.current.openSub("share", row, true));
        await sleep(1100);
        if (!ok()) break;
        act(() => ap.current.setSub(null));
        act(() => ap.current.setHl("pin"));
        await sleep(500);
        act(() => ap.current.run("tag:#30d158"));
        await sleep(900);
        if (!ok()) break;
        act(() => ap.current.close(false));
        await sleep(900);
        el = tile("f3");
        if (!el || !ok()) break;
        r = el.getBoundingClientRect();
        act(() => ap.current.openAt("f3", r.left + r.width * 0.5, r.top + r.height * 0.45));
        await sleep(500);
        act(() => ap.current.setHl("pin"));
        await sleep(600);
        if (!ok()) break;
        act(() => ap.current.run("pin"));
        await sleep(2200);
        if (!ok()) break;
        act(() => ap.current.setList(files));
        await sleep(600);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const [w, setW] = useState(560);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cols = w < 420 ? 2 : 4;

  const row = (r: Extract<Item, { id: string }>, inSubmenu: boolean, active: boolean, idx: number) => {
    const isCheck = r.kind === "check";
    const danger = r.kind === "item" && r.danger;
    const hasSub = r.kind === "item" && !!r.sub;
    const label = r.id === "delete" && armed ? "Delete? Click again" : r.label;
    return (
      <motion.div
        key={r.id}
        data-row={r.id}
        role={isCheck ? "menuitemcheckbox" : "menuitem"}
        aria-checked={isCheck ? (r as { on: boolean }).on : undefined}
        aria-haspopup={hasSub ? "menu" : undefined}
        aria-expanded={hasSub ? sub?.id === r.id : undefined}
        id={`${uid}-${r.id.replace(/[^a-z0-9]/gi, "")}`}
        onPointerEnter={(e) => (inSubmenu ? e.pointerType === "mouse" && setSubHl(r.id) : onRowEnter(e, r))}
        onClick={() => {
          if (hasSub) {
            const el = menuRef.current?.querySelector<HTMLElement>(`[data-row="${r.id}"]`);
            if (el) openSub(r.id, el, true);
          } else run(r.id);
        }}
        className={`relative flex h-[32px] cursor-default items-center gap-2.5 rounded-[8px] px-2.5 text-[13.5px] ${danger ? "text-[#d70015]" : "text-[#1d1d1f]"}`}
        initial={reduce || inSubmenu ? false : { opacity: 0, y: -3 }}
        animate={
          r.id === "delete" && armed && !reduce ? { opacity: 1, y: 0, x: [0, -3, 3, -2, 0] } : { opacity: 1, y: 0 }
        }
        transition={{
          delay: reduce || inSubmenu ? 0 : 0.012 * idx,
          duration: 0.16,
        }}
      >
        <span className={`relative ${active ? "text-white" : danger ? "text-[#d70015]" : "text-[#6e6e73]"}`}>
          <Ico d={r.icon} size={15} />
        </span>
        <span className={`relative flex-1 truncate ${active ? "text-white" : ""}`}>{label}</span>
        {isCheck && (r as { on: boolean }).on && (
          <span className={`relative ${active ? "text-white" : "text-[#0a84ff]"}`}>
            <Ico d={I.check} size={13} />
          </span>
        )}
        {r.kind === "item" && r.keys && (
          <span className={`relative text-[12px] tabular-nums ${active ? "text-white/80" : "text-[#86868b]"}`}>
            {r.keys}
          </span>
        )}
        {hasSub && (
          <span className={`relative ${active ? "text-white" : "text-[#86868b]"}`}>
            <Ico d={I.caret} size={10} />
          </span>
        )}
      </motion.div>
    );
  };

  const panel =
    "rounded-[14px] bg-[rgba(248,248,250,0.7)] p-[5px] shadow-[0_0_0_.5px_rgba(0,0,0,.22),inset_0_.5px_0_rgba(255,255,255,.9),inset_0_0_0_.5px_rgba(255,255,255,.35),0_2px_4px_rgba(0,0,0,.06),0_18px_44px_-8px_rgba(20,10,60,.45)] backdrop-blur-[28px] backdrop-saturate-[1.9] outline-none";

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={(e) => {
        if (e.isTrusted) touched.current = true;
      }}
      className={`relative w-full max-w-[600px] select-none overflow-hidden rounded-[28px] p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.45)] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
        minHeight: 380,
      }}
    >
      {/* the wallpaper: a dusk over hills, soft enough to read on, rich enough for the glass to blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 85% 10%, #ffb88a 0%, rgba(255,184,138,0) 55%), radial-gradient(80% 60% at 10% 20%, #7b6cf6 0%, rgba(123,108,246,0) 60%), radial-gradient(120% 90% at 50% 120%, #1e2a78 0%, rgba(30,42,120,0) 60%), linear-gradient(180deg, #5b5bd6 0%, #c16ba8 48%, #f39a7b 100%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full"
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${uid}-h1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2f8f" stopOpacity=".55" />
            <stop offset="1" stopColor="#1b1650" stopOpacity=".9" />
          </linearGradient>
          <linearGradient id={`${uid}-h2`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24205e" stopOpacity=".8" />
            <stop offset="1" stopColor="#0f0c33" />
          </linearGradient>
        </defs>
        <path d="M0 120 C 90 70 160 90 240 105 S 420 60 600 95 L600 200 L0 200 Z" fill={`url(#${uid}-h1)`} />
        <path d="M0 160 C 120 120 210 150 300 140 S 500 115 600 145 L600 200 L0 200 Z" fill={`url(#${uid}-h2)`} />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      <div className="relative flex items-baseline justify-between">
        <h3
          className="text-[17px] font-semibold tracking-[-0.02em] text-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.4)" }}
        >
          Desktop
        </h3>
        <p className="text-[12px] text-white/80" style={{ textShadow: "0 1px 2px rgba(0,0,0,.45)" }}>
          {cols === 2 ? "Long-press a file" : "Right-click a file, or focus it and press Shift F10"}
        </p>
      </div>

      <div
        className="relative mt-4 grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="list"
      >
        <AnimatePresence initial={false}>
          {list.map((f) => {
            const open = menu?.file === f.id;
            return (
              <motion.div
                key={f.id}
                layout={reduce ? false : "position"}
                role="listitem"
                initial={fresh === f.id && !reduce ? { opacity: 0, scale: 0.6, y: 10 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.5,
                        filter: "blur(6px)",
                        rotate: -6,
                        transition: { duration: 0.3 },
                      }
                }
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <div
                  data-file={f.id}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="menu"
                  aria-label={`${f.name}, ${f.meta}${f.pinned ? ", pinned" : ""}. Press Shift F10 for actions.`}
                  onContextMenu={(e: RMouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    openAt(f.id, e.clientX, e.clientY);
                  }}
                  onPointerDown={(e) => onTileDown(e, f.id)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onPointerMove={(e) =>
                    press.current &&
                    Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 8 &&
                    cancelPress()
                  }
                  onKeyDown={(e) => onTileKey(e, f.id)}
                  className="group relative flex flex-col items-center rounded-[16px] px-1 pb-2 pt-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  style={{ WebkitTouchCallout: "none" }}
                >
                  {f.pinned && (
                    <motion.span
                      className="absolute right-2.5 top-2.5 text-[#ff9f0a]"
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 18,
                      }}
                      aria-hidden="true"
                    >
                      <Ico d={I.pinFill} size={13} />
                    </motion.span>
                  )}
                  <span
                    className={`relative grid h-[76px] w-[76px] place-items-center rounded-[14px] transition-colors ${open ? "bg-black/[0.22]" : ""}`}
                  >
                    <FileArt kind={f.kind} uid={`${uid}${f.id}`} />
                  </span>
                  {renaming === f.id ? (
                    <input
                      autoFocus
                      defaultValue={f.name}
                      onFocus={(e) => {
                        const dot = f.name.lastIndexOf(".");
                        e.currentTarget.setSelectionRange(0, dot > 0 ? dot : f.name.length);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") {
                          e.currentTarget.value = f.name;
                          e.currentTarget.blur();
                        }
                      }}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim() || f.name;
                        setList((l) => l.map((x) => (x.id === f.id ? { ...x, name: v } : x)));
                        setRenaming(null);
                        if (v !== f.name) say(`Renamed to ${v}`);
                      }}
                      aria-label="New name"
                      className="mt-2.5 w-full rounded-[6px] bg-white px-1 py-0.5 text-center text-[12.5px] font-medium outline-none ring-2 ring-[#0a84ff]"
                    />
                  ) : (
                    <span
                      className={`mt-1.5 flex max-w-full items-center gap-1 rounded-[5px] px-1.5 py-[1px] text-[12.5px] font-medium text-white ${open ? "bg-[#0a84ff]" : ""}`}
                      style={{
                        textShadow: open ? "none" : "0 1px 2px rgba(0,0,0,.55), 0 0 8px rgba(0,0,0,.25)",
                      }}
                    >
                      {f.tag && (
                        <motion.span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: f.tag }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 18,
                          }}
                        />
                      )}
                      <span className="truncate">{f.name}</span>
                    </span>
                  )}
                  <span className="mt-0.5 text-[11px] text-white/75" style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
                    {f.meta}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* the menu */}
      <AnimatePresence>
        {menu && file && (
          <motion.div
            key={menu.file + menu.x}
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${file.name}`}
            aria-activedescendant={hl ? `${uid}-${hl.replace(/[^a-z0-9]/gi, "")}` : undefined}
            tabIndex={-1}
            onKeyDown={onMenuKey}
            onPointerMove={onMenuMove}
            onPointerLeave={() => !sub && setHl(null)}
            className={`absolute z-30 w-[236px] ${panel}`}
            style={{
              left: menu.x,
              top: menu.y,
              transformOrigin: `${menu.ox ? "100%" : "0%"} ${menu.oy ? "100%" : "0%"}`,
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{
              type: "spring",
              stiffness: 620,
              damping: 34,
              filter: { duration: 0.14 },
              opacity: { duration: 0.1 },
            }}
          >
            <Highlight panel={menuRef} id={hl} danger={hl === "delete"} reduce={reduce} />
            {items.map((it, k) => {
              if (it.kind === "sep")
                return <div key={`s${k}`} role="separator" className="mx-2.5 my-[5px] h-px bg-black/[0.08]" />;
              if (it.kind === "tags")
                return (
                  <div key="tags" className="flex items-center gap-2 px-2.5 py-2" role="group" aria-label="Colour tag">
                    {TAGS.map((c) => {
                      const on = file.tag === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          role="menuitemradio"
                          aria-checked={on}
                          aria-label={`Tag ${["red", "orange", "green", "blue", "purple"][TAGS.indexOf(c)]}`}
                          onPointerEnter={() => {
                            setHl(null);
                            if (sub) setSub(null);
                          }}
                          onClick={() => run(`tag:${c}`)}
                          className="grid h-[22px] w-[22px] place-items-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                          style={{
                            background: c,
                            boxShadow: on ? `0 0 0 2px #fff, 0 0 0 3.5px ${c}` : "inset 0 0 0 1px rgba(0,0,0,.08)",
                          }}
                        >
                          {on && <Ico d={I.check} size={11} />}
                        </button>
                      );
                    })}
                  </div>
                );
              return row(it, false, hl === it.id, k);
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the submenu */}
      <AnimatePresence>
        {menu && sub && subItems.length > 0 && (
          <motion.div
            key={sub.id}
            ref={subRef}
            role="menu"
            aria-label={rows.find((r) => r.id === sub.id)?.label}
            className={`absolute z-40 w-[196px] ${panel}`}
            style={{
              left: sub.left ? menu.x - 196 + 4 : menu.x + 236 - 4,
              top: menu.y + sub.top,
              transformOrigin: sub.left ? "100% 0%" : "0% 0%",
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: sub.left ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
              opacity: { duration: 0.1 },
            }}
            onPointerEnter={() => {
              if (subTimer.current) clearTimeout(subTimer.current);
              setHl(sub.id);
            }}
            onPointerLeave={() => setSubHl(null)}
          >
            <Highlight panel={subRef} id={subHl} danger={false} reduce={reduce} />
            {subItems.map((it, k) => row(it, true, subHl === it.id, k))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* what happened */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            role="status"
            className="absolute bottom-4 left-1/2 z-50 flex items-center gap-3 whitespace-nowrap rounded-full bg-[#1d1d1f] py-2 pl-4 pr-2 text-[13px] text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,.6)]"
            style={{ x: "-50%" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
          >
            <span className="max-w-[260px] truncate">{toast.text}</span>
            {toast.undo ? (
              <button
                type="button"
                onClick={toast.undo}
                className="rounded-full bg-white/[0.15] px-3 py-1 text-[12.5px] font-semibold outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Undo
              </button>
            ) : (
              <span className="w-2" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** the highlight behind the active row: one element that springs to wherever that row is */
function Highlight({
  panel,
  id,
  danger,
  reduce,
}: {
  panel: RefObject<HTMLDivElement | null>;
  id: string | null;
  danger: boolean;
  reduce: boolean;
}) {
  const [box, setBox] = useState<{ top: number; h: number } | null>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const el = id ? panel.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`) : null;
    setBox(el ? { top: el.offsetTop, h: el.offsetHeight } : null);
  }, [id, panel]);
  const jump = first.current || reduce;
  useEffect(() => {
    if (box) first.current = false;
  }, [box]);
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute left-[5px] right-[5px] top-0 rounded-[8px]"
      style={{
        background: danger ? "linear-gradient(180deg,#ff5b52,#e8322a)" : "linear-gradient(180deg,#2a95ff,#0a74ec)",
        boxShadow: "inset 0 .5px 0 rgba(255,255,255,.35), 0 1px 2px rgba(0,60,160,.25)",
      }}
      initial={false}
      animate={{ y: box?.top ?? 0, height: box?.h ?? 32, opacity: box ? 1 : 0 }}
      transition={
        jump
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 700,
              damping: 46,
              opacity: { duration: 0.08 },
            }
      }
    />
  );
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** file icons drawn as the things they are: a page with its corner folded, a folder with its tab, a photo print */
function FileArt({ kind, uid }: { kind: CtxFile["kind"]; uid: string }) {
  const id = uid.replace(/[^a-z0-9]/gi, "");
  const drop = "drop-shadow(0 3px 4px rgba(10,5,40,.35)) drop-shadow(0 1px 1px rgba(10,5,40,.25))";
  if (kind === "folder")
    return (
      <svg width="64" height="52" viewBox="0 0 64 52" style={{ filter: drop }} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fb4ff" />
            <stop offset="1" stopColor="#2f8fe8" />
          </linearGradient>
          <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd0ff" />
            <stop offset=".12" stopColor="#6cbcff" />
            <stop offset="1" stopColor="#3b9af0" />
          </linearGradient>
        </defs>
        <path
          d="M3 9a4 4 0 0 1 4-4h14.5c1.3 0 2.5.6 3.2 1.7L27 10h30a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"
          fill={`url(#${id}b)`}
        />
        <rect x="6" y="12" width="52" height="8" rx="2" fill="#fff" opacity=".85" />
        <path d="M3 18.5a4 4 0 0 1 4-4h50a4 4 0 0 1 4 4V46a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill={`url(#${id}f)`} />
        <path d="M7 15h50a3.5 3.5 0 0 1 3.5 3.5" stroke="#d6efff" strokeWidth=".8" fill="none" opacity=".9" />
        <path d="M24 33h16" stroke="#2a7fd6" strokeOpacity=".35" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (kind === "image")
    return (
      <svg
        width="62"
        height="50"
        viewBox="0 0 62 50"
        style={{ filter: drop, transform: "rotate(-3deg)" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff9a76" />
            <stop offset=".55" stopColor="#ffc78f" />
            <stop offset="1" stopColor="#ffe3b3" />
          </linearGradient>
          <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d5bd0" />
            <stop offset="1" stopColor="#3b2f8f" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="60" height="48" rx="2.5" fill="#fff" />
        <rect x="4.5" y="4.5" width="53" height="35" rx="1" fill={`url(#${id}s)`} />
        <circle cx="42" cy="17" r="5" fill="#fff6e0" />
        <path d="M4.5 33 L18 20 L27 28 L35 21 L57.5 37 V39.5 H4.5 Z" fill={`url(#${id}m)`} />
        <path d="M4.5 36 L22 27 L38 34 L57.5 30 V39.5 H4.5 Z" fill="#241d63" opacity=".85" />
        <rect x="4.5" y="4.5" width="53" height="35" rx="1" fill="none" stroke="rgba(0,0,0,.08)" />
      </svg>
    );
  const pdf = kind === "pdf";
  return (
    <svg width="46" height="58" viewBox="0 0 46 58" style={{ filter: drop }} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef0f4" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f7f9" />
          <stop offset="1" stopColor="#c9ced8" />
        </linearGradient>
      </defs>
      <path
        d="M4 1h27l14 14v39a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z"
        fill={`url(#${id}p)`}
        stroke="rgba(0,0,0,.12)"
        strokeWidth=".6"
      />
      <path d="M31 1v11a3 3 0 0 0 3 3h11z" fill={`url(#${id}c)`} />
      <path d="M31 12a3 3 0 0 0 3 3h11" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth=".6" />
      {[22, 27, 32, 37, 42].map((y, i) => (
        <rect key={y} x="8" y={y} width={i % 2 ? 22 : 30} height="1.6" rx=".8" fill="#c3c8d2" />
      ))}
      {pdf ? (
        <g>
          <rect x="1" y="44" width="32" height="10" rx="2" fill="#ff3b30" />
          <text
            x="17"
            y="51.6"
            textAnchor="middle"
            fontSize="7"
            fontWeight="800"
            fill="#fff"
            fontFamily="-apple-system, system-ui, sans-serif"
            letterSpacing=".3"
          >
            PDF
          </text>
        </g>
      ) : (
        <text
          x="8"
          y="53"
          fontSize="6.5"
          fontWeight="700"
          fill="#8e94a0"
          fontFamily="-apple-system, system-ui, sans-serif"
        >
          TXT
        </text>
      )}
    </svg>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
