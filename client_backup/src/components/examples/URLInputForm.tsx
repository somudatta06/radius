import URLInputForm from '../URLInputForm';

export default function URLInputFormExample() {
  return (
    <URLInputForm 
      onAnalyze={(url) => console.log('Analyzing:', url)}
      isLoading={false}
    />
  );
}
