use nlprule::{Rules, Tokenizer};
use wasm_bindgen::prelude::*;

mod utils;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct NlpRuleChecker {
    tokenizer: Tokenizer,
    rules: Rules,
}

#[wasm_bindgen]
impl NlpRuleChecker {
    pub fn new() -> Self {
        utils::set_panic_hook();

        let tokenizer_bytes: &'static [u8] = include_bytes!("../binaries/en_tokenizer.bin");
        let rules_bytes: &'static [u8] = include_bytes!("../binaries/en_rules.bin");

        log("Init Tokenizer");
        let tokenizer = Tokenizer::from_reader(tokenizer_bytes).expect("tokenizer binary is valid");

        log("Init Rules");
        let rules = Rules::from_reader(rules_bytes).expect("rules binary is valid");

        log("NlpRuleChecker is ready.");
        NlpRuleChecker { tokenizer, rules }
    }

    pub fn check(&self, text: &str) -> JsValue {
        let suggestions = self.rules.suggest(text, &self.tokenizer);
        JsValue::from_serde(&suggestions).unwrap()
    }

    pub fn sentencize(&self, text: &str) -> JsValue {
        let sentences = self.tokenizer.sentencize(text)
            .map(|it| it.text().to_string())
            .collect::<Vec<String>>();
        JsValue::from_serde(&sentences).unwrap()
    }

    pub fn tokenize(&self, text: &str) -> JsValue {
        let sentences = self.tokenizer.pipe(text)
            .map(|it| it.tokens().iter().map(|token| format!("{:?}", token)).collect())
            .collect::<Vec<String>>();
        JsValue::from_serde(&sentences).unwrap()
    }
}
