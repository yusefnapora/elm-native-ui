module ReactNative.ReactNative (VTree, node, view, text, image, string, property, style, imageSource, onPress) where

import Json.Encode
import Json.Decode
import Signal
import ReactNative.Style as RnStyle
import Native.ElmFunctions
import Native.ReactNative


type alias EventHandlerRef =
  Int


type VTree
  = VTree


type Property
  = Property



-- Nodes


node : String -> List Property -> List VTree -> VTree
node =
  Native.ReactNative.node


view : List Property -> List VTree -> VTree
view =
  node "React.View"


string : String -> VTree
string =
  Native.ReactNative.stringNode


text : List Property -> String -> VTree
text props textContent =
  node "React.Text" props [ (string textContent) ]


image : List Property -> String -> VTree
image props source =
  node "React.Image" ((imageSource source) :: props) []



-- Properties


property : String -> Json.Decode.Value -> Property
property =
  Native.ReactNative.property


style : List RnStyle.Style -> Property
style styles =
  styles
    |> RnStyle.encode
    |> property "style"


imageSource : String -> Property
imageSource uri =
  Json.Encode.object [ ( "uri", Json.Encode.string uri ) ]
    |> property "source"


on : String -> Json.Decode.Decoder a -> (a -> Signal.Message) -> Property
on =
  Native.ReactNative.on


onPress : Signal.Address a -> a -> Property
onPress address msg =
  on "Press" Json.Decode.value (\_ -> Signal.message address msg)
