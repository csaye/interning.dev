import ReactMarkdown from 'react-markdown'

type Props = {
  text: string
}

export default function Cell(props: Props) {
  const { text } = props

  const parsedText = text.replaceAll(/<\/?br\s*\/?>/g, '\n\n')

  return (
    <div>
      <ReactMarkdown
        components={{
          a: (props) => (
            <a href={props.href} target='_blank' rel='noopener noreferrer'>
              {props.children}
            </a>
          ),
        }}
        linkTarget='_blank'
      >
        {parsedText}
      </ReactMarkdown>
    </div>
  )
}
