# To run the docker
Before running the docker add to your env variables "PUBLIC_DIR"
```.env
PUBLIC_DIR=Path to the folder with the folders of the images
```

## For development

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Images Folder Structure

Each subfolder inside the images directory becomes a gallery, accessible at `/<gallery-name>`.

```
public/
├── gallery-name/
│   ├── photo1.jpg
│   ├── photo2.png
│   └── ...
├── another-gallery/
│   ├── photo1.jpg
│   └── ...
└── ...
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`