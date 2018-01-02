<template>
  <div>
      <div class="extra-toolbar">
          <div class="extra-toolbar-left">
              <label for="wysiwyg-image-upload" v-show="can_upload_images">
                    <svg fill="#BBBBBB" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                      Insert image
              </label>
              <input type="file" id="wysiwyg-image-upload" @change="insertFile" v-show="false">
          </div>
          <div class="extra-toolbar-right">
              <span class="extra-toolbar-text" v-show="last_saved_at">Last saved at: {{ last_saved_time }}</span>
              <button v-if="can_save" @click="saveContent" type="button">Save</button>
          </div>
          
      </div>
      <trix-editor ref="trix" input="dymantic-wysiwyg"></trix-editor>
      <input type="hidden" id="dymantic-wysiwyg" :name="name">
  </div>
</template>

<script>
import Trix from "trix";
import "trix/dist/trix.css";
import axios from "axios";

export default {
  model: {
    prop: "init-content",
    event: "input"
  },
  props: {
    name: {
      type: String,
      default: "wysiwyg_content"
    },
    "init-content": {
      type: String,
      default: ""
    },
    "save-url": {
      type: String,
      default: ""
    },
    "save-timer": {
      type: Number,
      default: 0
    },
    "image-upload-url": {
      type: String,
      default: ""
    },
    "max-file-size": {
      type: Number,
      default: 5
    }
  },

  data() {
    return {
      last_saved_at: null,
      last_saved_doc: null
    };
  },

  computed: {
    can_save() {
      return !!this.saveUrl;
    },

    can_upload_images() {
      return !!this.imageUploadUrl;
    },

    last_saved_time() {
      return this.last_saved_at ? this.last_saved_at.toLocaleTimeString() : "";
    },

    editor() {
      return this.$refs.trix.editor;
    }
  },

  mounted() {
    this.editor.insertHTML(this.initContent);
    this.attachListeners();
    if (this.saveTimer) {
      this.setSaveTimer(this.saveTimer);
    }
    Trix.config.attachments.preview.caption = { name: false, size: false };
  },

  methods: {
    attachListeners() {
      this.$refs.trix.addEventListener("trix-change", ev => {
        this.$emit("input", document.querySelector("#dymantic-wysiwyg").value);
      });

      if (!this.can_upload_images) {
        this.$refs.trix.addEventListener("trix-file-accept", ev => {
          ev.preventDefault();
        });
      }

      if (this.can_upload_images) {
        this.$refs.trix.addEventListener("trix-attachment-add", ev => {
          this.handleAttachment(ev.attachment);
        });
      }
    },

    insertFile(ev) {
      const file = ev.target.files[0];
      this.editor.insertFile(file);
    },

    saveContent() {
      this.last_saved_doc = this.editor.getDocument();
      axios
        .post(this.saveUrl, {
          body: document.querySelector("#dymantic-wysiwyg").value
        })
        .then(() => (this.last_saved_at = new Date()))
        .catch(() => this.$emit("failed-save"));
    },

    setSaveTimer(seconds) {
      setInterval(() => {
        if (!this.editor.getDocument().isEqualTo(this.last_saved_doc)) {
          this.saveContent();
        }
      }, seconds * 1000);
    },

    handleAttachment(attachment) {
      if (this.isInvalidAttachment(attachment)) {
        return;
      }

      axios
        .post(
          this.imageUploadUrl,
          this.prepareAttachmentPost(attachment.file),
          {
            onUploadProgress: ev =>
              attachment.setUploadProgress(ev.loaded / ev.total * 100)
          }
        )
        .then(({ data }) => {
          attachment.setAttributes({
            url: data.url,
            href: data.href
          });
        })
        .catch(() => this.$emit("attachment-rejected", "Upload failed"));
    },

    prepareAttachmentPost(file) {
      let fd = new FormData();
      fd.append("image", file);
      return fd;
    },

    isInvalidAttachment(attachment) {
      if (attachment.file.type.indexOf("image") !== 0) {
        this.$emit("attachment-rejected", "Not a valid image");
        return true;
      }

      if (attachment.file.size > this.maxFileSize * (1024 * 1000)) {
        console.log(attachment.file.size);
        this.$emit("attachment-rejected", "File size is too large");
        return true;
      }

      return false;
    }
  }
};
</script>

<style lang="scss" type="text/css">
.extra-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;

  svg {
    vertical-align: bottom;
  }

  .extra-toolbar-text {
    font-size: 0.75rem;
  }

  .extra-toolbar-right {
    width: 47%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    button {
      margin-left: 10px;
    }
  }

  .extra-toolbar-left {
    width: 47%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    button {
      margin-right: 10px;
    }
  }

  button {
    background: transparent;
    padding: 3px 5px;
  }
}

trix-editor > * {
  max-width: 800px;
  margin: 0 auto;

  img {
    max-width: 100%;
    height: auto;
  }
}
</style>


