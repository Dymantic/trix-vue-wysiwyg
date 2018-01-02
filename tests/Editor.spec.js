import { assert } from "chai";
import { mount } from "vue-test-utils";
import Wysiwyg from "../src/Wysiwyg.vue";

describe("a vue component wysiwyg", () => {
  it("contains the trix tag and input tag", () => {
    let wrapper = mount(Wysiwyg);

    assert.isTrue(wrapper.contains("trix-editor[input=dymantic-wysiwyg]"));
    assert.isTrue(wrapper.contains("input[id=dymantic-wysiwyg]"));
  });

  it("can have the name of the input passed as a prop", () => {
    let wrapper = mount(Wysiwyg, {
      propsData: {
        name: "editor_content"
      }
    });

    assert.isTrue(wrapper.contains("input[name=editor_content]"));
  });

  it("has a default name of content for the input name", () => {
    let wrapper = mount(Wysiwyg);

    assert.isTrue(wrapper.contains("input[name=content]"));
  });

  it("can be populated with existing content", () => {
    let wrapper = mount(Wysiwyg, {
      propsData: {
        value: "Test content"
      }
    });

    assert.isTrue(wrapper.contains("trix-editor[value='Test content']"));
  });

  it("emits an input event when editor content is changed", () => {
    let wrapper = mount(Wysiwyg);
    let input = wrapper.find("trix-editor");
    console.log(input.element);
    input.element.value = "Some test text";
    input.trigger("input");

    assert.exists(wrapper.emitted()["input"]);
  });
});
