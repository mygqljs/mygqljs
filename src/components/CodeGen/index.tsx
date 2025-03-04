import JSON5 from 'json5'
import { useMemo, useState } from 'react'
import { convertSchema } from 'generate-graphql-client'
import CodeEditor from '../CodeEditor'
import example from './example.json'
import Button from '../Button'
import css from './index.module.less'
import CopyButton from '../CopyButton'
import ModalWindow from '../ModalWindow'
import CodeViewer from '../CodeViewer'

export default function CodeGen() {
  const [tab, setTab] = useState<'input' | 'output'>('input')
  const [input, setInput] = useState(getExampleJSON)

  const result = useMemo<{
    error?: string
    code?: string
    time?: number
  }>(() => {
    if (tab === 'output') {
      try {
        const intro = JSON5.parse(input)
        if (intro && intro.data && intro.data.__schema) {
          const ctx = convertSchema(intro.data.__schema, {})
          return { code: ctx.getCode() }
        } else {
          return { error: 'The input is a introspection JSON.' }
        }
      } catch (err) {
        if (err && typeof (err as Error).message === 'string') {
          return { error: (err as Error).message }
        }
        return { error: 'Something went wrong :(' }
      }
    }
    return {}
  }, [tab, input])

  console.log(result)

  return (
    <div className={css.container}>
      <div className={css.content}>
        <h2 id="codegen">
          <a href="#codegen">
            Generate TypeScript code from GraphQL introspection
          </a>
        </h2>
        <p>
          Input your GraphQL introspection JSON to convert it to TypeScript
          code.
        </p>

        <IntrospectionTip />

        <div className={css.tabs}>
          <div
            className={css.tab}
            data-active={tab === 'input'}
            onClick={() => setTab('input')}
          >
            <b>Input</b> (json)
          </div>
          <div
            className={css.tab}
            data-active={tab === 'output'}
            onClick={() => setTab('output')}
          >
            <b>Output</b> (ts readonly)
          </div>
        </div>

        {tab === 'input' ? (
          <>
            <div className={css.input}>
              <CodeEditor
                lang="json"
                value={input}
                onChange={(val) => setInput(val)}
              />
            </div>
            <div className={css.actions}>
              <Button type="primary" onClick={() => setTab('output')}>
                Convert to TypeScript
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={css.output}>
              <CodeEditor lang="ts" value={result.code} readOnly />
            </div>
            <div className={css.actions}>
              <CopyButton value={result.code} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function getExampleJSON() {
  return JSON.stringify(example, null, 2)
}

const IntrospectionQuery = `query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type {
    ...TypeRef
  }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}`

function IntrospectionTip() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <blockquote>
        If you don't know where to find the GraphQL introspection,{' '}
        <a
          className="g-link"
          onClick={() => {
            setVisible(true)
          }}
        >
          you can click here to get help
        </a>
        .
      </blockquote>

      <ModalWindow
        visible={visible}
        title="How to get GraphQL introspection?"
        hideFooter
        noScrollBody
      >
        <div className={css.tip}>
          You can use the following GraphQL code to query the introspection:
        </div>
        <div className={css.introspectionQuery}>
          <CodeViewer value={IntrospectionQuery} lang="graphql" />
        </div>
        <div className={css.modalActions}>
          <Button
            onClick={() => {
              setVisible(false)
            }}
          >
            Close
          </Button>
          <CopyButton value={IntrospectionQuery} />
        </div>
      </ModalWindow>
    </>
  )
}
